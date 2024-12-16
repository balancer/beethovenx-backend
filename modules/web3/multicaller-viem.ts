import { ContractFunctionParameters } from 'viem';
import { Chain } from '@prisma/client';
import { getViemClient, ViemClient } from '../sources/viem-client';
import { set } from 'lodash';

export type ViemMulticallCall = { path: string } & ContractFunctionParameters;

/**
 * Wrapper for multicall that takes an array of calls and returns an object with the results mapped by the path
 *
 * @param client
 * @param calls
 * @returns
 */
export async function multicallViem<T extends Record<string, any>>(
    client: ViemClient,
    calls: ViemMulticallCall[],
    blockNumber?: bigint,
    batchSize?: number,
): Promise<T> {
    const results = await client.multicall({
        contracts: calls,
        blockNumber,
        batchSize,
        multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
    });

    const returnObject = {};
    let i = 0;
    for (const call of calls) {
        const resultValue = results[i].status === 'success' ? results[i].result : undefined;
        set(returnObject, call.path, resultValue);
        i++;
    }
    return returnObject as T;
}

export interface IMulticaller {
    numCalls: number;
    call(path: string, address: string, functionName: string, params?: any[], allowFailure?: boolean): IMulticaller;
    execute<T>(): Promise<T>;
}

export class Multicaller3Viem implements IMulticaller {
    private calls: Array<[string, string, any[], boolean]> = [];
    private paths: string[] = [];
    private client: ViemClient;
    private abi: ContractFunctionParameters['abi'];

    constructor(chain: Chain, abi: any, private batchSize = 1024, private blockNumber?: bigint) {
        this.client = getViemClient(chain);
        this.abi = abi;
    }

    call(path: string, address: string, functionName: string, params?: any[], allowFailure = true): IMulticaller {
        this.calls.push([address, functionName, params || [], allowFailure]);
        this.paths.push(path);
        return this;
    }

    async execute<T>(): Promise<T> {
        const results = await multicallViem(
            this.client,
            this.calls.map(([address, functionName, params], idx) => ({
                path: this.paths[idx],
                abi: this.abi,
                address: address as `0x${string}`,
                functionName,
                args: params,
            })),
            this.blockNumber,
            this.batchSize,
        );

        // Throw if any of the calls failed and allowFailure is false
        for (const idx in this.calls) {
            if (
                !this.calls[idx][3] &&
                this.paths[idx].split('.').reduce((acc, part) => acc?.[part], results) === undefined
            ) {
                throw new Error(`Multicall failed for call ${this.paths[idx]} ${this.calls[idx]}`);
            }
        }

        // Clear calls and paths
        this.calls = [];
        this.paths = [];

        return results as T;
    }

    get numCalls() {
        return this.calls.length;
    }
}
