import { prisma } from '../../prisma/prisma-client';
import { sheets } from '@googleapis/sheets';
import { env } from '../../apps/env';
import moment from 'moment-timezone';
import { JWT } from 'google-auth-library';
import { SecretsManager, secretsManager } from './secrets-manager';
import { googleJwtClient, GoogleJwtClient } from './google-jwt-client';
import { blocksSubgraphService } from '../subgraphs/blocks-subgraph/blocks-subgraph.service';
import { tokenService } from '../token/token.service';
import { beetsService } from '../beets/beets.service';
import { oneDayInSeconds, secondsPerDay } from '../common/time';
import { isComposableStablePool, isWeightedPoolV2 } from '../pool/lib/pool-utils';
import { networkContext } from '../network/network-context.service';
import { DeploymentEnv } from '../network/network-config-types';
import { Chain } from '@prisma/client';
import config from '../../config';

export class DatastudioService {
    constructor(private readonly secretsManager: SecretsManager, private readonly jwtClientHelper: GoogleJwtClient) {}

    public async feedPoolData(chain: Chain) {
        if ((env.DEPLOYMENT_ENV as DeploymentEnv) !== 'canary' && (env.DEPLOYMENT_ENV as DeploymentEnv) !== 'main') {
            return;
        }
        const privateKey = await this.secretsManager.getSecret('backend-v3-datafeed-privatekey');
        const jwtClient = await this.jwtClientHelper.getAuthorizedSheetsClient(privateKey);

        const databaseTabName = networkContext.data.datastudio![env.DEPLOYMENT_ENV as DeploymentEnv].databaseTabName;
        const sheetId = networkContext.data.datastudio![env.DEPLOYMENT_ENV as DeploymentEnv].sheetId;
        const compositionTabName =
            networkContext.data.datastudio![env.DEPLOYMENT_ENV as DeploymentEnv].compositionTabName;
        const emissionDataTabName =
            networkContext.data.datastudio![env.DEPLOYMENT_ENV as DeploymentEnv].emissionDataTabName;
        const chainSlug = networkContext.data.chain.slug;

        const timestampRange = `${databaseTabName}!B:B`;
        const poolAddressRange = `${databaseTabName}!D:D`;
        const totalSwapRange = `${databaseTabName}!J:J`;
        const chainRange = `${databaseTabName}!Y:Y`;
        let currentSheetValues;
        currentSheetValues = await sheets('v4').spreadsheets.values.batchGet({
            auth: jwtClient,
            spreadsheetId: sheetId,
            ranges: [timestampRange, poolAddressRange, totalSwapRange, chainRange],
            valueRenderOption: 'UNFORMATTED_VALUE',
        });

        // if there are no values in the sheet, take end of the day before yesterday which means the feed will run now
        let lastRun = moment.tz('GMT').endOf('day').subtract(2, 'day').unix();
        let timestampValues: number[][] = [];
        let poolAddressValues: string[][] = [];
        let totalSwapValues: string[][] = [];
        let chainValues: string[][] = [];
        if (currentSheetValues.data.valueRanges) {
            timestampValues = currentSheetValues.data.valueRanges[0].values || [];
            if (timestampValues[0][0].toString() !== 'Timestamp') {
                throw new Error('Wrong row for timestamp');
            }
            poolAddressValues = currentSheetValues.data.valueRanges[1].values || [];
            if (poolAddressValues[0][0].toString() !== 'address') {
                throw new Error('Wrong row for address');
            }
            totalSwapValues = currentSheetValues.data.valueRanges[2].values || [];
            if (totalSwapValues[0][0].toString() !== 'swapsCount') {
                throw new Error('Wrong row for swapsCount');
            }
            chainValues = currentSheetValues.data.valueRanges[3].values || [];
            if (chainValues[0][0].toString() !== 'chain') {
                throw new Error('Wrong row for chain');
            }
        }

        for (let i = timestampValues.length - 1; i >= 0; i--) {
            if (chainValues[i][0] === chainSlug) {
                lastRun = timestampValues[i][0];
                break;
            }
        }

        const now = moment.utc().unix();

        if (lastRun > now - oneDayInSeconds) {
            // 24 hours did not pass since the last run
            return;
        }

        const allPoolDataRows: string[][] = [];
        const allPoolCompositionRows: string[][] = [];
        const allEmissionDataRows: string[][] = [];
        const pools = await prisma.prismaPool.findMany({
            where: {
                dynamicData: {
                    totalLiquidity: { gte: 5000 },
                },
                chain: chain,
            },
            include: {
                dynamicData: true,
                tokens: true,
                allTokens: {
                    include: {
                        token: true,
                    },
                },
                staking: {
                    include: {
                        farm: { include: { rewarders: true } },
                        reliquary: true,
                        gauge: { include: { rewards: true } },
                    },
                },
            },
        });

        const endOfYesterday = moment.utc().endOf('day').subtract(1, 'day');

        for (const pool of pools) {
            let sharesChange = `0`;
            let tvlChange = `0`;
            let lpSwapFee = `0`;
            let protocolSwapFee = `0`;
            let dailySwaps = `0`;
            let lpYieldCapture = `0`;
            let protocolYieldCapture = `0`;

            let yesterdaySwapsCount = `0`;
            //find yesterdays entry of pool in currentSheet for the correct chain and get total swaps. If no previous value present, set previous value to 0
            for (let i = poolAddressValues.length - 1; i >= 0; i--) {
                if (
                    chainValues[i][0] === chainSlug &&
                    poolAddressValues[i][0] === pool.address
                    // timestampValues[i][0] === endOfYesterday.unix()
                ) {
                    yesterdaySwapsCount = totalSwapValues[i][0];
                    break;
                }
            }

            if (pool.dynamicData) {
                const protocolYieldFeePercentage = parseFloat(pool.dynamicData.protocolYieldFee || '');
                const protocolSwapFeePercentage = parseFloat(pool.dynamicData.protocolSwapFee);
                sharesChange = `${
                    parseFloat(pool.dynamicData.totalShares) - parseFloat(pool.dynamicData.totalShares24hAgo)
                }`;
                tvlChange = `${pool.dynamicData.totalLiquidity - pool.dynamicData.totalLiquidity24hAgo}`;
                lpSwapFee = `${pool.dynamicData.fees24h * (1 - protocolSwapFeePercentage)}`;
                protocolSwapFee = `${pool.dynamicData.fees24h * protocolSwapFeePercentage}`;

                lpYieldCapture =
                    pool.type === 'META_STABLE'
                        ? `${pool.dynamicData.yieldCapture24h * (1 - protocolSwapFeePercentage)}`
                        : `${pool.dynamicData.yieldCapture24h * (1 - protocolYieldFeePercentage)}`;

                protocolYieldCapture =
                    pool.type === 'META_STABLE'
                        ? `${pool.dynamicData.yieldCapture24h * protocolSwapFeePercentage}`
                        : `${pool.dynamicData.yieldCapture24h * protocolYieldFeePercentage}`;

                if (pool.dynamicData.isInRecoveryMode || pool.type === 'LIQUIDITY_BOOTSTRAPPING') {
                    //pool does not collect any protocol fees
                    lpSwapFee = `${pool.dynamicData.fees24h}`;
                    protocolSwapFee = `0`;

                    lpYieldCapture = `${pool.dynamicData.yieldCapture24h}`;
                    protocolYieldCapture = `0`;
                }

                dailySwaps = `${pool.dynamicData.swapsCount - parseFloat(yesterdaySwapsCount)}`;
            }

            const swapFee = pool.dynamicData?.swapFee || `0`;

            const blacklisted = pool.categories.find((category) => category === 'BLACK_LISTED');
            let poolType = pool.type.toString();
            if (isComposableStablePool(pool)) {
                poolType = 'COMPOSABLE_STABLE';
            }
            if (isWeightedPoolV2(pool)) {
                poolType = 'WEIGHTED_V2';
            }

            // add pool data
            allPoolDataRows.push([
                endOfYesterday.format('DD MMM YYYY'),
                `${endOfYesterday.unix()}`,
                `${now}`,
                pool.address,
                "'" + pool.name,
                poolType,
                pool.symbol,
                swapFee,
                pool.dynamicData?.totalLiquidity ? `${pool.dynamicData.totalLiquidity}` : `0`,
                pool.dynamicData?.swapsCount ? `${pool.dynamicData.swapsCount}` : `0`,
                pool.dynamicData?.totalShares ? `${pool.dynamicData.totalShares}` : `0`,
                pool.dynamicData?.lifetimeVolume ? `${pool.dynamicData.lifetimeVolume}` : `0`,
                pool.dynamicData?.lifetimeSwapFees ? `${pool.dynamicData.lifetimeSwapFees}` : `0`,
                tvlChange,
                dailySwaps,
                sharesChange,
                pool.dynamicData?.volume24h ? `${pool.dynamicData.volume24h}` : `0`,
                pool.dynamicData?.fees24h ? `${pool.dynamicData.fees24h}` : `0`,
                lpSwapFee,
                protocolSwapFee,
                pool.dynamicData?.yieldCapture24h ? `${pool.dynamicData.yieldCapture24h}` : `0`,
                lpYieldCapture,
                protocolYieldCapture,
                blacklisted ? 'yes' : 'no',
                chainSlug,
                `1`,
            ]);

            const allTokens = pool.allTokens.map((token) => {
                const poolToken = pool.tokens.find((poolToken) => poolToken.address === token.token.address);

                return {
                    ...token.token,
                    weight: poolToken?.weight,
                    balance: poolToken?.balance ? poolToken?.balance : 'not available',
                };
            });

            // add pool composition data
            for (const token of allTokens) {
                allPoolCompositionRows.push([
                    endOfYesterday.format('DD MMM YYYY'),
                    `${endOfYesterday.unix()}`,
                    `${now}`,
                    pool.address,
                    pool.id,
                    "'" + pool.name,
                    token.address,
                    token.name,
                    token.symbol,
                    token.weight ? token.weight : `0`,
                    `${token.balance}`,
                    chainSlug,
                ]);
            }

            // add emission data
            for (const stake of pool.staking) {
                const blocksPerDay = await blocksSubgraphService.getBlocksPerDay();
                const tokenPrices = await tokenService.getTokenPrices(stake.chain);
                const beetsPrice = tokenService.getPriceForToken(
                    tokenPrices,
                    config[chain].beets?.address || '',
                    chain,
                );
                if (stake.farm) {
                    const beetsPerDay = parseFloat(stake.farm.beetsPerBlock) * blocksPerDay;
                    const beetsValuePerDay = beetsPrice * beetsPerDay;
                    if (beetsPerDay > 0) {
                        allEmissionDataRows.push([
                            endOfYesterday.format('DD MMM YYYY'),
                            `${endOfYesterday.unix()}`,
                            `${now}`,
                            pool.address,
                            "'" + pool.name,
                            'BEETS',
                            networkContext.data.beets!.address,
                            `${beetsPerDay}`,
                            `${beetsValuePerDay}`,
                            chainSlug,
                        ]);
                    }
                    if (stake.farm.rewarders) {
                        for (const rewarder of stake.farm.rewarders) {
                            const rewardToken = await tokenService.getToken(rewarder.tokenAddress, chain);
                            if (!rewardToken) {
                                continue;
                            }
                            const rewardsPerDay = parseFloat(rewarder.rewardPerSecond) * secondsPerDay;
                            const rewardsValuePerDay =
                                tokenService.getPriceForToken(tokenPrices, rewarder.tokenAddress, chain) *
                                rewardsPerDay;
                            if (rewardsPerDay > 0) {
                                allEmissionDataRows.push([
                                    endOfYesterday.format('DD MMM YYYY'),
                                    `${endOfYesterday.unix()}`,
                                    `${now}`,
                                    pool.address,
                                    "'" + pool.name,
                                    rewardToken.symbol,
                                    rewardToken.address,
                                    `${rewardsPerDay}`,
                                    `${rewardsValuePerDay}`,
                                    chainSlug,
                                ]);
                            }
                        }
                    }
                }
                if (stake.reliquary) {
                    const beetsPerDay = parseFloat(stake.reliquary.beetsPerSecond) * secondsPerDay;
                    const beetsValuePerDay = beetsPrice * beetsPerDay;
                    if (beetsPerDay > 0) {
                        allEmissionDataRows.push([
                            endOfYesterday.format('DD MMM YYYY'),
                            `${endOfYesterday.unix()}`,
                            `${now}`,
                            pool.address,
                            "'" + pool.name,
                            'BEETS',
                            networkContext.data.beets!.address,
                            `${beetsPerDay}`,
                            `${beetsValuePerDay}`,
                            chainSlug,
                        ]);
                    }
                }
                if (stake.gauge) {
                    for (const reward of stake.gauge.rewards) {
                        const rewardToken = await tokenService.getToken(reward.tokenAddress, chain);
                        if (!rewardToken) {
                            continue;
                        }
                        const rewardsPerDay = parseFloat(reward.rewardPerSecond) * secondsPerDay;
                        const rewardsValuePerDay =
                            tokenService.getPriceForToken(tokenPrices, reward.tokenAddress, chain) * rewardsPerDay;
                        if (rewardsPerDay > 0) {
                            allEmissionDataRows.push([
                                endOfYesterday.format('DD MMM YYYY'),
                                `${endOfYesterday.unix()}`,
                                `${now}`,
                                pool.address,
                                "'" + pool.name,
                                rewardToken.symbol,
                                rewardToken.address,
                                `${rewardsPerDay}`,
                                `${rewardsValuePerDay}`,
                                chainSlug,
                            ]);
                        }
                    }
                }
            }
        }

        console.log(`Appending ${allPoolDataRows.length} rows to ${databaseTabName}.`);

        this.appendDataInSheet(databaseTabName, sheetId, 'A1:Z1', allPoolDataRows, jwtClient);

        console.log(`Appending ${allPoolCompositionRows.length} rows to ${compositionTabName}.`);

        this.appendDataInSheet(compositionTabName, sheetId, `A1:L1`, allPoolCompositionRows, jwtClient);

        console.log(`Appending ${allEmissionDataRows.length} rows to ${emissionDataTabName}.`);

        this.appendDataInSheet(emissionDataTabName, sheetId, 'A1:J1', allEmissionDataRows, jwtClient);
    }

    private async appendDataInSheet(
        tabName: string,
        sheetId: string,
        rowRange: string,
        rows: string[][],
        jwtClient: JWT,
    ) {
        await sheets('v4').spreadsheets.values.append({
            auth: jwtClient,
            spreadsheetId: sheetId,
            range: `${tabName}!${rowRange}`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                majorDimension: 'ROWS',
                range: `${tabName}!${rowRange}`,
                values: rows,
            },
        });
    }
}

export const datastudioService = new DatastudioService(secretsManager, googleJwtClient);
