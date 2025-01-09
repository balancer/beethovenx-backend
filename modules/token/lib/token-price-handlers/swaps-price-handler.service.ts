import { TokenPriceHandler } from '../../token-types';
import { PrismaTokenWithTypes } from '../../../../prisma/prisma-types';
import { prisma } from '../../../../prisma/prisma-client';
import { timestampRoundedUpToNearestHour } from '../../../common/time';
import moment from 'moment-timezone';
import _ from 'lodash';
import { tokenAndPrice, updatePrices } from './price-handler-helper';
import { Chain } from '@prisma/client';

type SwapPayload = {
    tokenIn: {
        address: string;
        amount: string;
    };
    tokenOut: {
        address: string;
        amount: string;
    };
};

export class SwapsPriceHandlerService implements TokenPriceHandler {
    public readonly exitIfFails = false;
    public readonly id = 'SwapsPriceHandlerService';

    private getAcceptedTokens(tokens: PrismaTokenWithTypes[]): PrismaTokenWithTypes[] {
        return tokens.filter((token) => !token.types.includes('BPT') && !token.types.includes('PHANTOM_BPT'));
    }

    public async updatePricesForTokens(
        tokens: PrismaTokenWithTypes[],
        chains: Chain[],
    ): Promise<PrismaTokenWithTypes[]> {
        const acceptedTokens = this.getAcceptedTokens(tokens);

        const updated: PrismaTokenWithTypes[] = [];
        const tokenAndPrices: tokenAndPrice[] = [];

        const timestamp = timestampRoundedUpToNearestHour();

        for (const chain of chains) {
            const acceptedTokensForChain = acceptedTokens.filter((token) => token.chain === chain);
            const tokenAddresses = acceptedTokensForChain.map((token) => token.address);

            const swaps = await prisma.prismaPoolEvent.findMany({
                where: {
                    chain: chain,
                    blockTimestamp: { gt: moment().unix() - 900 }, //only search for the last 15 minutes
                    type: 'SWAP',
                },
                orderBy: { blockTimestamp: 'desc' },
                select: { payload: true },
            });

            const otherTokenAddresses = [
                ...swaps
                    .filter((swap) => !tokenAddresses.includes((swap.payload as SwapPayload).tokenIn.address))
                    .map((swap) => (swap.payload as SwapPayload).tokenIn.address),
                ...swaps
                    .filter((swap) => !tokenAddresses.includes((swap.payload as SwapPayload).tokenOut.address))
                    .map((swap) => (swap.payload as SwapPayload).tokenOut.address),
            ];
            const tokenPrices = await prisma.prismaTokenPrice.findMany({
                where: { chain: chain, timestamp, tokenAddress: { in: otherTokenAddresses } },
            });

            for (const token of acceptedTokensForChain) {
                const tokenSwaps = swaps.filter(
                    (swap) =>
                        (swap.payload as SwapPayload).tokenIn.address === token.address ||
                        (swap.payload as SwapPayload).tokenOut.address === token.address,
                );

                for (const tokenSwap of tokenSwaps) {
                    const tokenSide: 'token-in' | 'token-out' =
                        (tokenSwap.payload as SwapPayload).tokenIn.address === token.address ? 'token-in' : 'token-out';
                    const tokenAmount = parseFloat(
                        tokenSide === 'token-in'
                            ? (tokenSwap.payload as SwapPayload).tokenIn.amount
                            : (tokenSwap.payload as SwapPayload).tokenOut.amount,
                    );
                    const otherToken =
                        tokenSide === 'token-in'
                            ? (tokenSwap.payload as SwapPayload).tokenOut.address
                            : (tokenSwap.payload as SwapPayload).tokenIn.address;
                    const otherTokenAmount = parseFloat(
                        tokenSide === 'token-in'
                            ? (tokenSwap.payload as SwapPayload).tokenOut.amount
                            : (tokenSwap.payload as SwapPayload).tokenIn.amount,
                    );
                    const otherTokenPrice = tokenPrices.find((tokenPrice) => tokenPrice.tokenAddress === otherToken);

                    if (otherTokenPrice) {
                        const otherTokenValue = otherTokenPrice.price * otherTokenAmount;
                        if (otherTokenValue > 1) {
                            const price = otherTokenValue / tokenAmount;

                            tokenAndPrices.push({
                                address: token.address,
                                chain: token.chain,
                                price: price,
                            });

                            updated.push(token);
                        }
                    }
                }
            }
        }

        await updatePrices(this.id, tokenAndPrices, timestamp);

        return updated;
    }
}
