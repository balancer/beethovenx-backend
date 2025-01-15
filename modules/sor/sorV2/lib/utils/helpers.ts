import {
    BatchSwapStep,
    BigintIsh,
    DEFAULT_USERDATA,
    PriceImpactAmount,
    SingleSwap,
    SwapKind,
    Token,
    TokenAmount,
} from '@balancer/sdk';
import { PathWithAmount } from '../path';
import { MathSol, abs } from './math';

import { HookState } from '@balancer-labs/balancer-maths';
import { LiquidityManagement } from '../../../types';

import { parseEther, parseUnits } from 'viem';

export function checkInputs(
    tokenIn: Token,
    tokenOut: Token,
    swapKind: SwapKind,
    swapAmount: BigintIsh | TokenAmount,
): TokenAmount {
    let amount: TokenAmount;

    if (swapAmount instanceof TokenAmount) {
        amount = swapAmount;
    } else {
        amount = TokenAmount.fromRawAmount(swapKind === SwapKind.GivenIn ? tokenIn : tokenOut, swapAmount);
    }

    if (
        (swapKind === SwapKind.GivenIn && !tokenIn.isEqual(amount.token)) ||
        (swapKind === SwapKind.GivenOut && !tokenOut.isEqual(amount.token))
    ) {
        throw new Error('Swap amount token does not match input token');
    }

    return amount;
}

export function calculatePriceImpact(paths: PathWithAmount[], swapKind: SwapKind): PriceImpactAmount {
    const pathsReverse = paths.map(
        (path) =>
            new PathWithAmount(
                [...path.tokens].reverse(),
                [...path.pools].reverse(),
                [...path.isBuffer].reverse(),
                swapKind === SwapKind.GivenIn ? path.outputAmount : path.inputAmount,
            ),
    );

    const amountInitial =
        swapKind === SwapKind.GivenIn ? getInputAmount(paths).amount : getInputAmount(pathsReverse).amount;

    const amountFinal =
        swapKind === SwapKind.GivenIn ? getOutputAmount(pathsReverse).amount : getOutputAmount(paths).amount;

    const priceImpact = MathSol.divDownFixed(amountInitial - amountFinal, amountInitial * 2n);
    return PriceImpactAmount.fromRawAmount(priceImpact);
}

export function getInputAmount(paths: PathWithAmount[]): TokenAmount {
    if (!paths.every((p) => p.inputAmount.token.isEqual(paths[0].inputAmount.token))) {
        throw new Error('Input amount can only be calculated if all paths have the same input token');
    }
    const amounts = paths.map((path) => path.inputAmount);
    return amounts.reduce((a, b) => a.add(b));
}

export function getOutputAmount(paths: PathWithAmount[]): TokenAmount {
    if (!paths.every((p) => p.outputAmount.token.isEqual(paths[0].outputAmount.token))) {
        throw new Error('Output amount can only be calculated if all paths have the same output token');
    }
    const amounts = paths.map((path) => path.outputAmount);
    return amounts.reduce((a, b) => a.add(b));
}

export function getHookState(pool: any): HookState | undefined {
    if (pool.hook === undefined || pool.hook === null) {
        return undefined;
    }

    if (pool.hook.name === 'ExitFee') {
        // api for this hook is an Object with removeLiquidityFeePercentage key & fee as string
        const dynamicData = pool.hook.dynamicData as { removeLiquidityFeePercentage: string };

        return {
            tokens: pool.tokens.map((token: { address: string }) => token.address),
            // ExitFeeHook will always have dynamicData as part of the API response
            removeLiquidityHookFeePercentage: parseEther(dynamicData.removeLiquidityFeePercentage),
            hookType: pool.hook.name,
        };
    }

    if (pool.hook.name === 'DirectionalFee') {
        // this hook does not require a hook state to be passed
        return {
            hookType: pool.hook.name,
        } as HookState;
    }

    if (pool.hook.name === 'StableSurge') {
        return {
            // amp onchain precision is 1000. Api returns 200 means onchain value is 200000
            amp: parseUnits(pool.typeData.amp, 3),
            // 18 decimal precision.
            surgeThresholdPercentage: parseEther(pool.hook.dynamicData.surgeThresholdPercentage),
            hookType: pool.hook.name,
        };
    }

    throw new Error(`${pool.hook.name} hook not implemented`);
}

export function isLiquidityManagement(value: any): value is LiquidityManagement {
    return (
        value &&
        typeof value.disableUnbalancedLiquidity === 'boolean' &&
        typeof value.enableAddLiquidityCustom === 'boolean' &&
        typeof value.enableDonation === 'boolean' &&
        typeof value.enableRemoveLiquidityCustom === 'boolean'
    );
}
