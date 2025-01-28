export const abi = [
    {
        inputs: [{ internalType: 'contract ISilo', name: '_silo', type: 'address' }],
        name: 'getDepositAPR',
        outputs: [{ internalType: 'uint256', name: 'depositAPR', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;
