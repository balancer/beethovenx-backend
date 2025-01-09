import { BigintIsh, Token, TokenAmount, WAD } from '@balancer/sdk';
import { BasePoolToken } from './basePoolToken';

export class Erc4626PoolToken extends BasePoolToken {
    public readonly rate: bigint;
    public readonly unwrapRate: bigint;
    public readonly underlyingTokenAddress: string;

    public constructor(
        token: Token,
        amount: BigintIsh,
        index: number,
        rate: bigint,
        unwrapRate: bigint,
        underlyingTokenAddress: string,
    ) {
        super(token, amount, index);
        this.rate = rate;
        this.unwrapRate = unwrapRate;
        this.underlyingTokenAddress = underlyingTokenAddress;
    }

    public increase(amount: bigint): TokenAmount {
        this.amount = this.amount + amount;
        this.scale18 = (this.amount * this.scalar * this.rate) / WAD;
        return this;
    }

    public decrease(amount: bigint): TokenAmount {
        this.amount = this.amount - amount;
        this.scale18 = (this.amount * this.scalar * this.rate) / WAD;
        return this;
    }
}
