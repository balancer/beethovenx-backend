import {
    GqlSorGetSwapPaths,
    GqlSorGetSwapsResponse,
    QuerySorGetSwapPathsArgs,
    QuerySorGetSwapsArgs,
} from '../../schema';
import { sorV2Service } from './sorV2/sorPathService';
import { GetSwapsV2Input as GetSwapPathsInput } from './types';
import { getToken, getTokenAmountHuman, swapPathsZeroResponse, zeroResponse } from './utils';
import { AllNetworkConfigsKeyedOnChain } from '../network/network-config';

export class SorService {
    async getSorSwapPaths(args: QuerySorGetSwapPathsArgs): Promise<GqlSorGetSwapPaths> {
        console.log('getSorSwaps args', JSON.stringify(args));
        const tokenIn = args.tokenIn.toLowerCase();
        const tokenOut = args.tokenOut.toLowerCase();
        const amountToken = args.swapType === 'EXACT_IN' ? tokenIn : tokenOut;
        const emptyResponse = swapPathsZeroResponse(args.tokenIn, args.tokenOut);

        if (parseFloat(args.swapAmount) <= 0) {
            return emptyResponse;
        }

        const wethIsEth =
            tokenIn === AllNetworkConfigsKeyedOnChain[args.chain].data.eth.address ||
            tokenOut === AllNetworkConfigsKeyedOnChain[args.chain].data.eth.address;

        // check if tokens addresses exist
        try {
            await getToken(tokenIn, args.chain!);
            await getToken(tokenOut, args.chain!);
        } catch (e: any) {
            // Just log to console for parsing
            console.log('Missing token for SOR request', `in: ${tokenIn}`, `out: ${tokenOut}`, args.chain);
            return emptyResponse;
        }

        // we return an empty response if tokenIn and tokenOut are the same
        // also if tokenIn and tokenOut is weth/eth
        if (
            tokenIn === tokenOut ||
            (wethIsEth &&
                (tokenIn === AllNetworkConfigsKeyedOnChain[args.chain].data.weth.address ||
                    tokenOut === AllNetworkConfigsKeyedOnChain[args.chain].data.weth.address))
        ) {
            return emptyResponse;
        }

        // Use TokenAmount to help follow scaling requirements in later logic
        // args.swapAmount is HumanScale
        const amount = await getTokenAmountHuman(amountToken, args.swapAmount, args.chain!);

        const getSwapPathsInput: Omit<GetSwapPathsInput, 'protocolVersion'> = {
            chain: args.chain!,
            swapAmount: amount,
            swapType: args.swapType,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            queryBatchSwap: args.queryBatchSwap ? args.queryBatchSwap : false,
            callDataInput: args.callDataInput
                ? {
                      receiver: args.callDataInput.receiver,
                      sender: args.callDataInput.sender,
                      slippagePercentage: args.callDataInput.slippagePercentage,
                      deadline: args.callDataInput.deadline,
                      wethIsEth: wethIsEth,
                  }
                : undefined,
        };

        if (args.useProtocolVersion) {
            return sorV2Service.getSorSwapPaths({
                ...getSwapPathsInput,
                protocolVersion: args.useProtocolVersion,
            });
        }

        return this.getBestSwapPathVersion(getSwapPathsInput);
    }

    async getSorSwaps(args: QuerySorGetSwapsArgs): Promise<GqlSorGetSwapsResponse> {
        console.log('getSorSwaps args', JSON.stringify(args));
        const tokenIn = args.tokenIn.toLowerCase();
        const tokenOut = args.tokenOut.toLowerCase();
        const amountToken = args.swapType === 'EXACT_IN' ? tokenIn : tokenOut;
        const emptyResponse = zeroResponse(args.swapType, args.tokenIn, args.tokenOut, args.swapAmount);

        if (parseFloat(args.swapAmount) <= 0) {
            return emptyResponse;
        }

        // check if tokens addresses exist
        try {
            await getToken(tokenIn, args.chain!);
            await getToken(tokenOut, args.chain!);
        } catch (e) {
            console.log(e);
            return emptyResponse;
        }

        // Use TokenAmount to help follow scaling requirements in later logic
        // args.swapAmount is HumanScale
        const amount = await getTokenAmountHuman(amountToken, args.swapAmount, args.chain!);

        const swapResult = await sorV2Service.getSwapResult({
            chain: args.chain!,
            swapAmount: amount,
            swapOptions: args.swapOptions,
            swapType: args.swapType,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
        });

        if (!swapResult) return emptyResponse;

        try {
            // Updates with latest onchain data before returning
            return swapResult.getSorSwapResponse(
                args.swapOptions.queryBatchSwap ? args.swapOptions.queryBatchSwap : false,
            );
        } catch (err) {
            console.log(`Error Retrieving QuerySwap`, err);
            return emptyResponse;
        }
    }

    private async getBestSwapPathVersion(input: Omit<GetSwapPathsInput, 'protocolVersion'>) {
        const swapBalancerV2 = await sorV2Service.getSorSwapPaths({ ...input, protocolVersion: 2 });
        const swapBalancerV3 = await sorV2Service.getSorSwapPaths({ ...input, protocolVersion: 3 });
        if (input.swapType === 'EXACT_IN') {
            return parseFloat(swapBalancerV2.returnAmount) > parseFloat(swapBalancerV3.returnAmount)
                ? swapBalancerV2
                : swapBalancerV3;
        } else {
            // return swap path with smallest non-zero amountsIn (if it exists)
            if (parseFloat(swapBalancerV2.returnAmount) === 0) {
                return swapBalancerV3;
            } else if (parseFloat(swapBalancerV3.returnAmount) === 0) {
                return swapBalancerV2;
            } else {
                return parseFloat(swapBalancerV2.returnAmount) < parseFloat(swapBalancerV3.returnAmount)
                    ? swapBalancerV2
                    : swapBalancerV3;
            }
        }
    }
}

export const sorService = new SorService();
