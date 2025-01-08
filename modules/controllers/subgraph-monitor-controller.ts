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
                    if (!subgraphUrl.includes('thegraph') && !subgraphUrl.includes('goldsky')) {
                        continue;
                    }

                    const latestBlock = await viemClient.getBlockNumber();
                    let lag = 0;

                    const subgraph = new GaugeSubgraphService(subgraphUrl as string);

                    const meta = await subgraph.getMetadata();
                    lag = Math.max(Number(latestBlock) - meta.block.number, 0);

                    let subgraphUrlClean = subgraphUrl;
                    if (subgraphUrl.includes('gateway')) {
                        const parts = subgraphUrl.split('/');
                        parts.splice(4, 1);
                        subgraphUrlClean = parts.join('/');
                    }

                    subgraphMetricPublisher.publish(
                        `${config.data.chain.slug}-${subgraphName}-lag-${subgraphUrl}`,
                        lag,
                    );
                }
            }
        },
    };
}
