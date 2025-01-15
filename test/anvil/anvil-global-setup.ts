import dotenv from 'dotenv';
dotenv.config();

import { Anvil, CreateAnvilOptions, createAnvil } from '@viem/anvil';
import { ChainId } from '@balancer/sdk';
import { sleep } from '../utils';

type NetworkSetup = {
    rpcEnv: string;
    fallBackRpc: string | undefined;
    port: number;
    forkBlockNumber: bigint;
};

type NetworksWithFork = Extract<
    keyof typeof ChainId,
    'MAINNET' | 'POLYGON' | 'FANTOM' | 'SEPOLIA' | 'OPTIMISM' | 'GNOSIS_CHAIN'
>;

const ANVIL_PORTS: Record<NetworksWithFork, number> = {
    //Ports separated by 100 to avoid port collision when running tests in parallel
    MAINNET: 8645,
    POLYGON: 8745,
    FANTOM: 8845,
    SEPOLIA: 8945,
    OPTIMISM: 9045,
    GNOSIS_CHAIN: 9145,
};

export const ANVIL_NETWORKS: Record<NetworksWithFork, NetworkSetup> = {
    MAINNET: {
        rpcEnv: 'ETHEREUM_RPC_URL',
        fallBackRpc: 'https://mainnet.gateway.tenderly.co',
        port: ANVIL_PORTS.MAINNET,
        forkBlockNumber: 18980070n,
    },
    POLYGON: {
        rpcEnv: 'POLYGON_RPC_URL',
        // Public Polygon RPCs are usually unreliable
        fallBackRpc: undefined,
        port: ANVIL_PORTS.POLYGON,
        // Note - this has to be >= highest blockNo used in tests
        forkBlockNumber: 44215395n,
    },
    FANTOM: {
        rpcEnv: 'FANTOM_RPC_URL',
        // Public Fantom RPCs are usually unreliable
        fallBackRpc: undefined,
        port: ANVIL_PORTS.FANTOM,
        forkBlockNumber: 65313450n,
    },
    SEPOLIA: {
        rpcEnv: 'SEPOLIA_RPC_URL',
        fallBackRpc: 'https://sepolia.gateway.tenderly.co',
        port: ANVIL_PORTS.SEPOLIA,
        forkBlockNumber: 5490330n,
    },
    OPTIMISM: {
        rpcEnv: 'OPTIMISM_RPC_URL',
        fallBackRpc: 'https://optimism.gateway.tenderly.co',
        port: ANVIL_PORTS.OPTIMISM,
        forkBlockNumber: 117374265n,
    },
    GNOSIS_CHAIN: {
        rpcEnv: 'GNOSIS_CHAIN_RPC_URL',
        fallBackRpc: 'https://rpc.ankr.com/gnosis',
        port: ANVIL_PORTS.GNOSIS_CHAIN,
        forkBlockNumber: 35214423n,
    },
};

function getAnvilOptions(network: NetworkSetup, blockNumber?: bigint): CreateAnvilOptions {
    let forkUrl: string;
    if (process.env[network.rpcEnv] !== undefined) {
        forkUrl = process.env[network.rpcEnv] as string;
    } else {
        if (!network.fallBackRpc) throw Error(`Please add a environment variable for: ${network.rpcEnv}`);
        forkUrl = network.fallBackRpc;
        console.warn(`\`${network.rpcEnv}\` not found. Falling back to \`${forkUrl}\`.`);
    }
    const port = network.port;
    const forkBlockNumber = blockNumber ?? network.forkBlockNumber;
    return {
        forkUrl,
        port,
        forkBlockNumber,
    };
}

// Controls the current running forks to avoid starting the same fork twice
let runningForks: Record<number, Anvil> = {};

// Make sure that forks are stopped after each test suite
export async function stopAnvilForks() {
    await Promise.all(
        Object.values(runningForks).map(async (anvil) => {
            // console.log('Stopping anvil fork', anvil.options);
            return anvil.stop();
        }),
    );
    runningForks = {};
}

// Stop a specific anvil fork
export async function stopAnvilFork(
    network: NetworkSetup,
    jobId = Number(process.env.VITEST_WORKER_ID) || 0,
    blockNumber?: bigint, // If not provided, the fork will start from the network's forkBlockNumber
) {
    const anvilOptions = getAnvilOptions(network, blockNumber);

    const defaultAnvilPort = 8545;
    const port = (anvilOptions.port || defaultAnvilPort) + jobId;
    // Avoid starting fork if it was running already
    if (!runningForks[port]) return;

    await runningForks[port].stop();
    delete runningForks[port];
}

/*
    Starts an anvil fork with the given options.
    In vitest, each thread is assigned a unique, numerical id (`process.env.VITEST_POOL_ID`).
    When jobId is provided, the fork uses this id to create a different local rpc url (e.g. `http://127.0.0.1:<8545+jobId>/`
    so that tests can be run in parallel (depending on the number of threads of the host machine)
*/
export async function startFork(
    network: NetworkSetup,
    jobId = Number(process.env.VITEST_WORKER_ID) || 0,
    blockNumber?: bigint, // If not provided, the fork will start from the network's forkBlockNumber
) {
    try {
        const anvilOptions = getAnvilOptions(network, blockNumber);

        const defaultAnvilPort = 8545;
        const port = (anvilOptions.port || defaultAnvilPort) + jobId;

        if (!anvilOptions.forkUrl) {
            throw Error('Anvil forkUrl must have a value. Please review your anvil setup');
        }
        const rpcUrl = `http://127.0.0.1:${port}`;

        console.log('checking rpcUrl', port, runningForks);

        // Avoid starting fork if it was running already
        if (runningForks[port]) return { rpcUrl };

        // https://www.npmjs.com/package/@viem/anvil
        const anvil = createAnvil({ ...anvilOptions, port });
        // Save reference to running fork
        runningForks[port] = anvil;

        if (process.env.SKIP_GLOBAL_SETUP === 'true') {
            console.warn(`🛠️  Skipping global anvil setup. You must run the anvil fork manually. Example:
anvil --fork-url https://eth-mainnet.alchemyapi.io/v2/<your-key> --port 8545 --fork-block-number=17878719
`);
            await sleep(5000);
            return { rpcUrl };
        }
        console.log('🛠️  Starting anvil', {
            port,
            forkBlockNumber: blockNumber ?? anvilOptions.forkBlockNumber,
        });
        await anvil.start();
        return {
            rpcUrl,
        };
    } catch (e) {
        throw e;
    }
}
