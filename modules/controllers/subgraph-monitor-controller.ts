import { Chain } from '@prisma/client';
import { syncMerklRewards } from '../actions/aprs/merkl';
import { SwapFeeFromSnapshotsAprService } from '../pool/lib/apr-data-sources/swap-fee-apr-from-snapshots.service';
import { prisma } from '../../prisma/prisma-client';
import { subgraphMetricPublisher } from '../metrics/metrics.client';
import { AllNetworkConfigs } from '../network/network-config';
import { GaugeSubgraphService } from '../subgraphs/gauge-subgraph/gauge-subgraph.service';
import { getViemClient } from '../sources/viem-client';

export function SubgraphMonitorController(tracer?: any) {
    return {
        async postSubgraphLagMetrics() {
            for (const id in AllNetworkConfigs) {
                const config = AllNetworkConfigs[id];

                const viemClient = getViemClient(config.data.chain.prismaId);

                for (const [subgraphName, subgraphUrl] of Object.entries(config.data.subgraphs)) {
                    if (
                        typeof subgraphUrl === 'string' &&
                        !subgraphUrl.includes('thegraph') &&
                        !subgraphUrl.includes('goldsky')
                    ) {
                        continue;
                    }

                    const latestBlock = await viemClient.getBlockNumber();
                    let lag = 0;

                    if (subgraphName === 'balancer') {
                        const subgraphArray = subgraphUrl as string[];

                        // we are reusing an arbitrary subgraph service that has the getMeta method
                        const subgraph = new GaugeSubgraphService(subgraphArray[0]);

                        const meta = await subgraph.getMetadata();
                        lag = Math.max(Number(latestBlock) - meta.block.number, 0);
                    } else {
                        const subgraph = new GaugeSubgraphService(subgraphUrl as string);

                        const meta = await subgraph.getMetadata();
                        lag = Math.max(Number(latestBlock) - meta.block.number, 0);
                    }
                    subgraphMetricPublisher.publish(
                        `${config.data.chain.slug}-${subgraphName}-${subgraphUrl}-lag`,
                        lag,
                    );
                }
            }
        },
    };
}
