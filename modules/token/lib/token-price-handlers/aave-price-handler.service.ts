import { TokenPriceHandler } from '../../token-types';
import { PrismaTokenWithTypes } from '../../../../prisma/prisma-types';
import { timestampRoundedUpToNearestHour } from '../../../common/time';
import { prisma } from '../../../../prisma/prisma-client';
import _ from 'lodash';
import { tokenAndPrice, updatePrices } from './price-handler-helper';
import { Chain } from '@prisma/client';
import { parseAbiItem } from 'abitype';
import { getViemClient } from '../../../sources/viem-client';

const aaveTokens = {
    [Chain.MAINNET]: [
        {
            // stataEthUSDT
            wrappedToken: '0x65799b9fd4206cdaa4a1db79254fcbc2fd2ffee6',
            aToken: '0x23878914efe38d27c4d67ab83ed1b93a74d4086a',
            underlying: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
        {
            // stataEthUSDT
            wrappedToken: '0x862c57d48becb45583aeba3f489696d22466ca1b',
            aToken: '0x23878914efe38d27c4d67ab83ed1b93a74d4086a',
            underlying: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
        {
            // stataEthUSDC
            wrappedToken: '0x02c2d189b45ce213a40097b62d311cf0dd16ec92',
            aToken: '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c',
            underlying: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
        {
            // waEthLido
            wrappedToken: '0x0fe906e030a44ef24ca8c7dc7b7c53a6c4f00ce9',
            aToken: '0xfa1fdbbd71b0aa16162d76914d69cd8cb3ef92da',
            underlying: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        },
        {
            // waEthLidowstETH
            wrappedToken: '0x775f661b0bd1739349b9a2a3ef60be277c5d2d29',
            aToken: '0xc035a7cf15375ce2706766804551791ad035e0c2',
            underlying: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
        },
    ],
    [Chain.OPTIMISM]: [
        {
            // stataOptUSDC - USDC.e
            wrappedToken: '0x9f281eb58fd98ad98ede0fc4c553ad4d73e7ca2c',
            aToken: '0x625e7708f30ca75bfd92586e17077590c60eb4cd',
            underlying: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
        },
        {
            // stataOptUSDC - USDCn
            wrappedToken: '0x4dd03dfd36548c840b563745e3fbec320f37ba7e',
            aToken: '0x38d693ce1df5aadf7bc62595a37d667ad57922e5',
            underlying: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
        },
        {
            // stataOptUSDC - USDT
            wrappedToken: '0x035c93db04e5aaea54e6cd0261c492a3e0638b37',
            aToken: '0x6ab707aca953edaefbc4fd23ba73294241490620',
            underlying: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        },
    ],
    [Chain.ARBITRUM]: [
        {
            // stataArbUSDT
            wrappedToken: '0x8b5541b773dd781852940490b0c3dc1a8cdb6a87',
            aToken: '0x6ab707aca953edaefbc4fd23ba73294241490620',
            underlying: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        },
        {
            // stataArbUSDT
            wrappedToken: '0xb165a74407fe1e519d6bcbdec1ed3202b35a4140',
            aToken: '0x6ab707aca953edaefbc4fd23ba73294241490620',
            underlying: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        },
        {
            // stataArbUSDCn
            wrappedToken: '0x7cfadfd5645b50be87d546f42699d863648251ad',
            aToken: '0x724dc807b04555b71ed48a6896b6f41593b8c637',
            underlying: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        },
        {
            // stataArbUSDCn - USD Coin (Arb1)
            wrappedToken: '0xbde67e089886ec0e615d6f054bc6f746189a3d56',
            aToken: '0x724dc807b04555b71ed48a6896b6f41593b8c637',
            underlying: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        },
        {
            // stataArbUSDC - USD Coin (Arb1) - different wrapping
            wrappedToken: '0x3a301e7917689b8e8a19498b8a28fc912583490c',
            aToken: '0x625e7708f30ca75bfd92586e17077590c60eb4cd',
            underlying: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
        },
    ],
    [Chain.POLYGON]: [
        {
            //stataPolUSDT
            wrappedToken: '0x31f5ac91804a4c0b54c0243789df5208993235a1',
            aToken: '0x6ab707aca953edaefbc4fd23ba73294241490620',
            underlying: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        },
        {
            //stataPolUSDT
            wrappedToken: '0x87a1fdc4c726c459f597282be639a045062c0e46',
            aToken: '0x6ab707aca953edaefbc4fd23ba73294241490620',
            underlying: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        },
        {
            //stataPolUSDC - USD Coin (PoS)
            wrappedToken: '0xc04296aa4534f5a3bab2d948705bc89317b2f1ed',
            aToken: '0x625e7708f30ca75bfd92586e17077590c60eb4cd',
            underlying: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        },
        {
            //stataPolUSDCn - USDCn
            wrappedToken: '0x2dca80061632f3f87c9ca28364d1d0c30cd79a19',
            aToken: '0xa4d94019934d8333ef880abffbf2fdd611c762bd',
            underlying: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        },
    ],
    [Chain.AVALANCHE]: [
        {
            // stataAvaUSDT
            wrappedToken: '0x759a2e28d4c3ad394d3125d5ab75a6a5d6782fd9',
            aToken: '0x6ab707aca953edaefbc4fd23ba73294241490620',
            underlying: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
        },
        {
            // stataAvaUSDC
            wrappedToken: '0xe7839ea8ea8543c7f5d9c9d7269c661904729fe7',
            aToken: '0x625e7708f30ca75bfd92586e17077590c60eb4cd',
            underlying: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
        },
        {
            // StataAvaDAI
            wrappedToken: '0x234c4b76f749dfffd9c18ea7cc0972206b42d019',
            aToken: '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee',
            underlying: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
        },
        {
            // stataAvaWETH
            wrappedToken: '0x41bafe0091d55378ed921af3784622923651fdd8',
            aToken: '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8',
            underlying: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
        },
        {
            // stataAvaWAVAX
            wrappedToken: '0xa291ae608d8854cdbf9838e28e9badcf10181669',
            aToken: '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97',
            underlying: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
        },
    ],
    [Chain.BASE]: [
        {
            // Static Aave Base USDC
            wrappedToken: '0x4ea71a20e655794051d1ee8b6e4a3269b13ccacc',
            aToken: '0x4e65fe4dba92790696d040ac24aa414708f5c0ab ',
            underlying: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        },
    ],
    [Chain.GNOSIS]: [
        {
            // stataGnoUSDC
            wrappedToken: '0x270ba1f35d8b87510d24f693fccc0da02e6e4eeb',
            aToken: '0xc6b7aca6de8a6044e0e32d0c841a89244a10d284',
            underlying: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
        },
        {
            // stataGnoUSDCe
            wrappedToken: '0xf0e7ec247b918311afa054e0aedb99d74c31b809',
            aToken: '0xc0333cb85b59a788d8c7cae5e1fd6e229a3e5a65',
            underlying: '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0',
        },
        {
            // waGnoUSDCe
            wrappedToken: '0x51350d88c1bd32cc6a79368c9fb70373fb71f375',
            aToken: '0xc0333cb85b59a788d8c7cae5e1fd6e229a3e5a65',
            underlying: '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0',
        },
        {
            // waGnoWETH
            wrappedToken: '0x57f664882f762fa37903fc864e2b633d384b411a',
            aToken: '0xa818f1b57c201e092c4a2017a91815034326efd1',
            underlying: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
        },
        {
            // waGnoGNO
            wrappedToken: '0x7c16f0185a26db0ae7a9377f23bc18ea7ce5d644',
            aToken: '0xa1fa064a85266e2ca82dee5c5ccec84df445760e',
            underlying: '0x9c58bacc331c9aa871afd802db6379a98e80cedb',
        },
    ],
    [Chain.SEPOLIA]: [
        {
            // Static Aave USDC
            wrappedToken: '0x8a88124522dbbf1e56352ba3de1d9f78c143751e',
            aToken: '0x16da4541ad1807f4443d92d26044c1147406eb80',
            underlying: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
        },
        {
            // Static Aave DAI
            wrappedToken: '0xde46e43f46ff74a23a65ebb0580cbe3dfe684a17',
            aToken: '0x29598b72eb5cebd806c5dcd549490fda35b13cd8',
            underlying: '0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357',
        },
    ],
};

export class AavePriceHandlerService implements TokenPriceHandler {
    public readonly exitIfFails = false;
    public readonly id = 'AavePriceHandlerService';

    private getAcceptedTokens(tokens: PrismaTokenWithTypes[]): PrismaTokenWithTypes[] {
        return tokens.filter((token) =>
            (aaveTokens[token.chain as keyof typeof aaveTokens] || [])
                .flatMap((t) => t.wrappedToken)
                .includes(token.address),
        );
    }

    public async updatePricesForTokens(tokens: PrismaTokenWithTypes[]): Promise<PrismaTokenWithTypes[]> {
        const acceptedTokens = this.getAcceptedTokens(tokens);
        const tokenAndPrices: tokenAndPrice[] = [];
        const timestamp = timestampRoundedUpToNearestHour();

        // Group tokens by chain
        const tokensByChain = _.groupBy(acceptedTokens, 'chain');

        const updatedTokens: PrismaTokenWithTypes[] = [];
        for (const chain in tokensByChain) {
            const aaveChain = chain as keyof typeof aaveTokens;
            // Fetch rates for aave tokens
            const addresses = aaveTokens[aaveChain].map((token) => token.wrappedToken);
            const underlying = aaveTokens[aaveChain].map((token) => token.underlying);
            const contracts = addresses.map((address) => ({
                address: address as `0x${string}`,
                // Returns rates for the rebasing tokens returned in RAYs (27 decimals)
                abi: [parseAbiItem('function rate() view returns (uint256)')],
                functionName: 'rate',
            }));
            const rates = await getViemClient(chain as Chain)
                .multicall({ contracts, allowFailure: true })
                .then((res) => res.map((r) => (r.status === 'success' ? r.result : 1000000000000000000000000000n)));
            const rateMap = _.zipObject(
                addresses,
                rates.map((r) => Number(r) / 1e27),
            );

            const underlyingPrices = await prisma.prismaTokenCurrentPrice.findMany({
                where: { tokenAddress: { in: _.uniq(underlying) }, chain: chain as Chain },
            });
            const underlyingMap = _.zipObject(
                underlyingPrices.map((p) => p.tokenAddress),
                underlyingPrices,
            );

            for (const token of tokensByChain[chain]) {
                const underlying = aaveTokens[aaveChain].find((t) => t.wrappedToken === token.address)?.underlying;
                if (!underlying) {
                    throw new Error(`AavePriceHandlerService: Underlying token for ${token.address} not found`);
                }
                try {
                    const price = Number((rateMap[token.address] * underlyingMap[underlying].price).toFixed(2));

                    updatedTokens.push(token);
                    tokenAndPrices.push({
                        address: token.address,
                        chain: token.chain,
                        price,
                    });
                } catch (e: any) {
                    console.error('Aave price failed for', token.address, chain, e.message);
                }
            }
        }

        await updatePrices(this.id, tokenAndPrices, timestamp);

        return updatedTokens;
    }
}
