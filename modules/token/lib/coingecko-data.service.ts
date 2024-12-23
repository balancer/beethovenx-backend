import { prisma } from '../../../prisma/prisma-client';
import _, { add } from 'lodash';
import { env } from '../../../apps/env';
import { RateLimiter } from 'limiter';
import axios, { AxiosError } from 'axios';
import config from '../../../config';
import { Chain } from '@prisma/client';

type Price = { usd: number };
interface HistoricalPriceResponse {
    market_caps: number[][];
    prices: number[][];
    total_volumes: number[][];
}

type HistoricalPrice = { timestamp: number; price: number };
export type TokenHistoricalPrices = { [address: string]: HistoricalPrice[] };

interface CoingeckoTokenMarketData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number | null;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: Date;
    atl: number;
    atl_change_percentage: number;
    atl_date: Date;
    roi: null;
    last_updated: Date;
    price_change_percentage_14d_in_currency: number;
    price_change_percentage_1h_in_currency: number;
    price_change_percentage_24h_in_currency: number;
    price_change_percentage_30d_in_currency: number;
    price_change_percentage_7d_in_currency: number;
}

interface CoinId {
    id: string;
    symbol: string;
    name: string;
    platforms: Record<string, string>;
}

/* coingecko has a rate limit of 10-50req/minute
   https://www.coingecko.com/en/api/pricing:
   Our free API has a rate limit of 10-50 calls per minute,
   if you exceed that limit you will be blocked until the next 1 minute window.
   Do revise your queries to ensure that you do not exceed our limits should
   that happen.

*/
const tokensPerMinute = env.COINGECKO_API_KEY ? 10 : 3;
const requestRateLimiter = new RateLimiter({ tokensPerInterval: tokensPerMinute, interval: 'minute' });
//max 10 addresses per request because of URI size limit, pro is max 180 because of URI limit
const addressChunkSize = env.COINGECKO_API_KEY ? 180 : 20;
export class CoingeckoDataService {
    private readonly baseUrl: string;
    private readonly fiatParam: string;
    private readonly apiKeyParam: string;

    constructor() {
        this.baseUrl = env.COINGECKO_API_KEY
            ? 'https://pro-api.coingecko.com/api/v3'
            : 'https://api.coingecko.com/api/v3';
        this.fiatParam = 'usd';
        this.apiKeyParam = env.COINGECKO_API_KEY ? `&x_cg_pro_api_key=${env.COINGECKO_API_KEY}` : '';
    }

    public async syncCoingeckoIds() {
        // Q: Do coingecko IDs change?
        const allTokens = await prisma.prismaToken.findMany({
            where: {
                OR: [{ coingeckoTokenId: null }, { coingeckoPlatformId: null }],
                AND: {
                    chain: {
                        not: 'SEPOLIA',
                    },
                },
            },
        });

        const coinIds = await this.getCoinIdList();
        const platformToChain = Object.fromEntries(
            Object.entries(config)
                .filter(([chain, _]) => chain !== 'SEPOLIA') // Sepolia is not in CG
                .map(([chain, chainConfig]) => [chainConfig.coingecko.platformId, chain]),
        );
        const coinMap = coinIds.reduce((acc, coin) => {
            for (const [platform, address] of Object.entries(coin.platforms)) {
                if (platformToChain[platform]) {
                    // tokenAddress-chain
                    acc[`${address.toLowerCase()}-${platformToChain[platform]}`] = coin.id;
                }
            }
            return acc;
        }, {} as Record<string, string>);

        const updates = allTokens
            .map((token) => {
                const coingeckoTokenId = coinMap[`${token.address}-${token.chain}`];
                const coingeckoPlatformId = config[token.chain].coingecko.platformId;

                if (token.coingeckoTokenId !== coingeckoTokenId || token.coingeckoPlatformId !== coingeckoPlatformId) {
                    return prisma.prismaToken.update({
                        where: {
                            address_chain: { address: token.address, chain: token.chain },
                        },
                        data: {
                            coingeckoTokenId,
                            coingeckoPlatformId,
                        },
                    });
                }
            })
            .filter((update): update is NonNullable<typeof update> => !!update);

        await prisma.$transaction(updates);
    }

    // public async getTokenHistoricalPrices(address: string, days: number): Promise<HistoricalPrice[]> {
    //     const now = Math.floor(Date.now() / 1000);
    //     const end = now;
    //     const start = end - days * twentyFourHoursInSecs;
    //     const tokenDefinitions = await tokenService.getTokenDefinitions([networkContext.chain]);
    //     const mapped = this.getMappedTokenDetails(address, tokenDefinitions);

    //     const endpoint = `/coins/${mapped.platform}/contract/${mapped.address}/market_chart/range?vs_currency=${this.fiatParam}&from=${start}&to=${end}`;

    //     const result = await this.get<HistoricalPriceResponse>(endpoint);

    //     return result.prices.map((item) => ({
    //         //anchor to the start of the hour
    //         timestamp:
    //             moment
    //                 .unix(item[0] / 1000)
    //                 .startOf('hour')
    //                 .unix() * 1000,
    //         price: item[1],
    //     }));
    // }

    public async getMarketDataForTokenIds(tokenIds: string[]): Promise<CoingeckoTokenMarketData[]> {
        const endpoint = `/coins/markets?vs_currency=${this.fiatParam}&ids=${tokenIds}&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d`;

        return this.get<CoingeckoTokenMarketData[]>(endpoint);
    }

    private async getCoinIdList(): Promise<CoinId[]> {
        const endpoint = `/coins/list?include_platform=true`;
        return this.get<CoinId[]>(endpoint);
    }

    private async get<T>(endpoint: string): Promise<T> {
        const remainingRequests = await requestRateLimiter.removeTokens(1);
        console.log('Remaining coingecko requests', remainingRequests);
        let response;
        try {
            response = await axios.get(this.baseUrl + endpoint + this.apiKeyParam);
        } catch (err: any | AxiosError) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 429) {
                    throw Error(`Coingecko ratelimit: ${err}`);
                }
            }
            throw err;
        }
        return response.data;
    }
}

export const coingeckoDataService = new CoingeckoDataService();
