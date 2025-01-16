import {
    BatchSwapStep,
    DEFAULT_FUND_MANAGMENT,
    DEFAULT_USERDATA,
    PriceImpactAmount,
    SingleSwap,
    Slippage,
    SwapKind,
    TokenAmount,
    ZERO_ADDRESS,
    balancerQueriesAbi,
    vaultV2Abi,
} from '@balancer/sdk';
import { PathWithAmount } from './path';
import { cloneDeep } from 'lodash';
import { Address, Hex, createPublicClient, encodeFunctionData, getContract, http } from 'viem';
import { MathSol, abs } from './utils/math';
import { chainIdToChain } from '../../../network/chain-id-to-chain';
import config from '../../../../config';

// A Swap can be a single or multiple paths
export class SwapLocal {
    public constructor({ paths, swapKind }: { paths: PathWithAmount[]; swapKind: SwapKind }) {
        if (paths.length === 0) throw new Error('Invalid swap: must contain at least 1 path.');

        // paths with immutable pool balances
        this.pathsImmutable = cloneDeep(paths);

        // Recalculate paths while mutating pool balances
        this.paths = paths.map(
            (path) => new PathWithAmount(path.tokens, path.pools, path.isBuffer, path.swapAmount, true),
        );
        this.chainId = paths[0].tokens[0].chainId;
        this.swapKind = swapKind;
        this.isBatchSwap = paths.length > 1 || paths[0].pools.length > 1;
        this.assets = [...new Set(paths.flatMap((p) => p.tokens).map((t) => t.address))];
        const swaps = this.getSwaps(this.paths);

        this.assets = this.assets.map((a) => {
            return this.convertNativeAddressToZero(a);
        });

        this.swaps = swaps;
    }

    public readonly chainId: number;
    public readonly isBatchSwap: boolean;
    public readonly paths: PathWithAmount[];
    public readonly pathsImmutable: PathWithAmount[];
    public readonly assets: Address[];
    public readonly swapKind: SwapKind;
    public swaps: BatchSwapStep[] | SingleSwap;

    public get quote(): TokenAmount {
        return this.swapKind === SwapKind.GivenIn ? this.outputAmount : this.inputAmount;
    }

    public get inputAmount(): TokenAmount {
        return this.getInputAmount(this.paths);
    }

    public get outputAmount(): TokenAmount {
        return this.getOutputAmount(this.paths);
    }

    // rpcUrl is optional, but recommended to prevent rate limiting
    public async query(rpcUrl?: string, block?: bigint): Promise<TokenAmount> {
        const client = createPublicClient({
            transport: http(rpcUrl),
        });

        const queriesContract = getContract({
            address: config[chainIdToChain[this.chainId]].balancer.v2.balancerQueriesAddress as Address,
            abi: balancerQueriesAbi,
            client,
        });

        let amount: TokenAmount;
        if (this.isBatchSwap) {
            const { result } = await queriesContract.simulate.queryBatchSwap(
                [this.swapKind, this.swaps as BatchSwapStep[], this.assets, DEFAULT_FUND_MANAGMENT],
                {
                    blockNumber: block,
                },
            );

            amount =
                this.swapKind === SwapKind.GivenIn
                    ? TokenAmount.fromRawAmount(
                          this.outputAmount.token,
                          abs(
                              result[
                                  this.assets.indexOf(this.convertNativeAddressToZero(this.outputAmount.token.address))
                              ],
                          ),
                      )
                    : TokenAmount.fromRawAmount(
                          this.inputAmount.token,
                          abs(
                              result[
                                  this.assets.indexOf(this.convertNativeAddressToZero(this.inputAmount.token.address))
                              ],
                          ),
                      );
        } else {
            const { result } = await queriesContract.simulate.querySwap(
                [this.swaps as SingleSwap, DEFAULT_FUND_MANAGMENT],
                { blockNumber: block },
            );

            amount =
                this.swapKind === SwapKind.GivenIn
                    ? TokenAmount.fromRawAmount(this.outputAmount.token, result)
                    : TokenAmount.fromRawAmount(this.inputAmount.token, result);
        }

        return amount;
    }

    private convertNativeAddressToZero(address: Address): Address {
        return address === config[chainIdToChain[this.chainId]].eth.address ? ZERO_ADDRESS : address;
    }

    public queryCallData(): string {
        let callData: string;
        if (this.isBatchSwap) {
            callData = encodeFunctionData({
                abi: balancerQueriesAbi,
                functionName: 'queryBatchSwap',
                args: [this.swapKind, this.swaps as BatchSwapStep[], this.assets, DEFAULT_FUND_MANAGMENT],
            });
        } else {
            callData = encodeFunctionData({
                abi: balancerQueriesAbi,
                functionName: 'querySwap',
                args: [this.swaps as SingleSwap, DEFAULT_FUND_MANAGMENT],
            });
        }
        return callData;
    }

    public get priceImpact(): PriceImpactAmount {
        const paths = this.pathsImmutable;

        const pathsReverse = paths.map(
            (path) =>
                new PathWithAmount(
                    [...path.tokens].reverse(),
                    [...path.pools].reverse(),
                    [...path.isBuffer].reverse(),
                    this.swapKind === SwapKind.GivenIn ? path.outputAmount : path.inputAmount,
                ),
        );

        const amountInitial =
            this.swapKind === SwapKind.GivenIn ? this.getInputAmount(paths).amount : this.getOutputAmount(paths).amount;

        const amountFinal =
            this.swapKind === SwapKind.GivenIn
                ? this.getOutputAmount(pathsReverse).amount
                : this.getInputAmount(pathsReverse).amount;

        const priceImpact = MathSol.divDownFixed(abs(amountInitial - amountFinal), amountInitial * 2n);
        return PriceImpactAmount.fromRawAmount(priceImpact);
    }

    /**
     * Takes a slippage acceptable by the user and returns the limits for a swap to be executed
     *
     * @param slippage slippage tolerance accepted by the user. Can be built using Slippage.fromPercentage() or any of its variations.
     * @param expectedAmount is the amount that the user expects to receive or send, can be obtained from swap.query()
     * @returns
     */
    limits(slippage: Slippage, expectedAmount: TokenAmount): bigint[] {
        const limits = new Array(this.assets.length).fill(0n);
        let limitAmount: bigint;
        if (this.swapKind === SwapKind.GivenIn) {
            limitAmount = slippage.applyTo(expectedAmount.amount, -1);
        } else {
            limitAmount = slippage.applyTo(expectedAmount.amount);
        }

        if (!this.isBatchSwap) {
            return [limitAmount];
        }

        for (let i = 0; i < this.assets.length; i++) {
            if (
                this.assets[i] === this.inputAmount.token.address ||
                (this.assets[i] === ZERO_ADDRESS &&
                    this.inputAmount.token.address === config[chainIdToChain[this.chainId]].eth.address)
            ) {
                if (this.swapKind === SwapKind.GivenIn) {
                    limits[i] = this.inputAmount.amount;
                } else {
                    limits[i] = limitAmount;
                }
            }
            if (
                this.assets[i] === this.outputAmount.token.address ||
                (this.assets[i] === ZERO_ADDRESS &&
                    this.outputAmount.token.address === config[chainIdToChain[this.chainId]].eth.address)
            ) {
                if (this.swapKind === SwapKind.GivenIn) {
                    limits[i] = -1n * limitAmount;
                } else {
                    limits[i] = -1n * this.outputAmount.amount;
                }
            }
        }

        return limits;
    }

    /**
     * Returns the transaction data to be sent to the vault contract
     *
     * @param limits calculated from swap.limits()
     * @param deadline unix timestamp
     * @param sender address of the sender
     * @param recipient defaults to sender
     * @returns
     */
    transactionData(limits: bigint[], deadline: bigint, sender: Address, recipient = sender) {
        return {
            to: this.to(),
            data: this.callData(limits, deadline, sender, recipient),
            value: this.value(limits),
        };
    }

    /**
     * Returns the native assset value to be sent to the vault contract based on the swap kind and the limit amounts
     *
     * @param limits calculated from swap.limits()
     * @returns
     */
    private value(limits: bigint[]): bigint {
        let value = 0n;
        if (this.inputAmount.token.address === config[chainIdToChain[this.chainId]].eth.address) {
            const idx = this.assets.indexOf(ZERO_ADDRESS);
            value = limits[idx];
        }
        return value;
    }

    private to(): Address {
        return config[chainIdToChain[this.chainId]].balancer.v2.vaultAddress as Address;
    }

    /**
     * Returns the call data to be sent to the vault contract for the swap execution.
     *
     * @param limits calculated from swap.limits()
     * @param deadline unix timestamp
     * @param sender address of the sender
     * @param recipient defaults to sender
     * @returns
     */
    private callData(
        limits: bigint[],
        deadline: bigint,
        sender: Address,
        recipient = sender,
        internalBalances = {
            to: false,
            from: false,
        },
    ): Hex {
        let callData: Hex;

        const funds = {
            sender,
            recipient,
            fromInternalBalance: internalBalances.from,
            toInternalBalance: internalBalances.to,
        };

        if (this.isBatchSwap) {
            callData = encodeFunctionData({
                abi: vaultV2Abi,
                functionName: 'batchSwap',
                args: [this.swapKind, this.swaps as BatchSwapStep[], this.assets, funds, limits, deadline],
            });
        } else {
            callData = encodeFunctionData({
                abi: vaultV2Abi,
                functionName: 'swap',
                args: [this.swaps as SingleSwap, funds, limits[0], deadline],
            });
        }

        return callData;
    }

    // public get executionPrice(): Price {}

    // helper methods

    private getSwaps(paths: PathWithAmount[]) {
        let swaps: BatchSwapStep[] | SingleSwap;
        if (this.isBatchSwap) {
            swaps = [] as BatchSwapStep[];
            if (this.swapKind === SwapKind.GivenIn) {
                paths.map((p) => {
                    p.pools.map((pool, i) => {
                        (swaps as BatchSwapStep[]).push({
                            poolId: pool.id,
                            assetInIndex: BigInt(this.assets.indexOf(p.tokens[i].address)),
                            assetOutIndex: BigInt(this.assets.indexOf(p.tokens[i + 1].address)),
                            amount: i === 0 ? p.inputAmount.amount : 0n,
                            userData: DEFAULT_USERDATA,
                        });
                    });
                });
            } else {
                paths.map((p) => {
                    // Vault expects given out swaps to be in reverse order
                    const reversedPools = [...p.pools].reverse();
                    const reversedTokens = [...p.tokens].reverse();
                    reversedPools.map((pool, i) => {
                        (swaps as BatchSwapStep[]).push({
                            poolId: pool.id,
                            assetInIndex: BigInt(this.assets.indexOf(reversedTokens[i + 1].address)),
                            assetOutIndex: BigInt(this.assets.indexOf(reversedTokens[i].address)),
                            amount: i === 0 ? p.outputAmount.amount : 0n,
                            userData: DEFAULT_USERDATA,
                        });
                    });
                });
            }
        } else {
            const path = this.paths[0];
            const pool = path.pools[0];
            const assetIn = this.convertNativeAddressToZero(path.tokens[0].address);
            const assetOut = this.convertNativeAddressToZero(path.tokens[1].address);
            swaps = {
                poolId: pool.id,
                kind: this.swapKind,
                assetIn,
                assetOut,
                amount: path.swapAmount.amount,
                userData: DEFAULT_USERDATA,
            } as SingleSwap;
        }
        return swaps;
    }

    private getInputAmount(paths: PathWithAmount[]): TokenAmount {
        if (!paths.every((p) => p.inputAmount.token.isEqual(paths[0].inputAmount.token))) {
            throw new Error('Input amount can only be calculated if all paths have the same input token');
        }
        const amounts = paths.map((path) => path.inputAmount);
        return amounts.reduce((a, b) => a.add(b));
    }

    private getOutputAmount(paths: PathWithAmount[]): TokenAmount {
        if (!paths.every((p) => p.outputAmount.token.isEqual(paths[0].outputAmount.token))) {
            throw new Error('Output amount can only be calculated if all paths have the same output token');
        }
        const amounts = paths.map((path) => path.outputAmount);
        return amounts.reduce((a, b) => a.add(b));
    }
}
