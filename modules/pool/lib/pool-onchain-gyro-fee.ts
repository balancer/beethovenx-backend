import { Multicaller3 } from '../../web3/multicaller3';
import { PrismaPoolType } from '@prisma/client';
import abi from '../abi/GyroConfig.json';
import { defaultAbiCoder } from '@ethersproject/abi';
import { formatBytes32String } from '@ethersproject/strings';
import { keccak256 } from '@ethersproject/solidity';
import { formatEther } from 'ethers/lib/utils';

interface PoolInput {
    id: string;
    address: string;
    type: PrismaPoolType;
    version?: number;
}

interface OnchainGyroFees {
    eclpFee?: string;
    defaultFee?: string;
    pools?: {
        [id: string]: {
            poolFee?: string;
        };
    }
}

export const fetchOnChainGyroFees = async (
  pools: PoolInput[],
  gyroConfigAddress?: string,
  batchSize = 1024
) => {
    if (pools.length === 0 || !gyroConfigAddress) {
        return {};
    }

    const multicaller = new Multicaller3(abi, batchSize);

    const feeKey = formatBytes32String('PROTOCOL_SWAP_FEE_PERC');

    const eclpKey = keccak256(
        ['bytes'],
        [
            defaultAbiCoder.encode(
                ['bytes32', 'bytes32'],
                [feeKey, formatBytes32String('ECLP')]
            ),
        ]
    );
    multicaller.call('defaultFee', gyroConfigAddress, 'getUint', [feeKey]);
    multicaller.call('eclpFee', gyroConfigAddress, 'getUint', [eclpKey]);

    let poolTypeLookup: { [id: string]: PrismaPoolType } = {};
    pools.forEach(({ id, type, address }) => {
        if (type.includes('GYRO')) {
            const poolFeeKey = keccak256(
                ['bytes'],
                [
                    defaultAbiCoder.encode(
                    ['bytes32', 'uint256'],
                    [feeKey, address]
                    ),
                ]
            );

            multicaller.call(`pools.${id}.poolFee`, gyroConfigAddress, 'getUint', [poolFeeKey]);

            poolTypeLookup[id] = type;
        }
    });

    const results = (await multicaller.execute()) as OnchainGyroFees;
    const defaultFee = results.defaultFee ?? '0';
    const eclpFee = results.eclpFee ?? '0';

    let parsed: { [address: string]: string } = {};
    if (results.pools) {
        parsed = Object.fromEntries(
            Object.entries(results.pools).map(([id, { poolFee }]) => [id,
                formatEther(
                    poolFee ? poolFee : poolTypeLookup[id].includes('GYROE') ? eclpFee : defaultFee
                )
            ])
        );
    }

    return parsed;
};
