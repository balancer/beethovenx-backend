import {
    CloudWatchClient,
    CloudWatchClientConfig,
    MetricDatum,
    PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import * as Sentry from '@sentry/node';
import { env } from '../../apps/env';

export interface NotificationsCloudwatchMetric {
    merticData: MetricDatum[];
    nameSpace: string;
}

export class CloudwatchMetricsPublisher {
    protected environment: string;
    protected configuration?: CloudWatchClientConfig;
    private client: CloudWatchClient;
    public namespace: string;

    constructor(
        namespace: string = 'default',
        environment: string = env.DEPLOYMENT_ENV,
        configuration?: CloudWatchClientConfig,
    ) {
        this.namespace = namespace;
        this.environment = environment;
        this.client = new CloudWatchClient({ region: env.AWS_REGION, ...configuration });
    }

    public async publish(metricName: string, count?: number): Promise<void> {
        try {
            const command = new PutMetricDataCommand({
                MetricData: [
                    {
                        MetricName: metricName,
                        Dimensions: [
                            {
                                Name: 'Environment',
                                Value: this.environment,
                            },
                        ],
                        Unit: 'None',
                        Timestamp: new Date(),
                        Value: count ? count : 1,
                    },
                ],
                Namespace: this.namespace,
            });

            await this.client.send(command);
        } catch (err) {
            // Sentry.captureException(`Failed to publish "${metricName}" in "${this.environment}: ${err}`);
            console.log(`Failed to publish "${metricName}" in "${this.environment}: ${err}`);
        }
    }
}

export const cronsMetricPublisher = new CloudwatchMetricsPublisher('backendCrons');

export const subgraphMetricPublisher = new CloudwatchMetricsPublisher('backendSubgraphs');
