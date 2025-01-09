import { BigintIsh, Token } from '@balancer/sdk';
import { Erc4626PoolToken } from '../../poolsV2/erc4626PoolToken';

export class WeightedErc4626PoolToken extends Erc4626PoolToken {
    public readonly weight: bigint;

    public constructor(
        token: Token,
        amount: BigintIsh,
        index: number,
        rate: bigint,
        unwrapRate: bigint,
        underlyingTokenAddress: string,
        weight: BigintIsh,
    ) {
        super(token, amount, index, rate, unwrapRate, underlyingTokenAddress);
        this.weight = BigInt(weight);
    }
}
