import {
    CloudWatchClient,
    DeleteAlarmsCommand,
    DescribeAlarmsCommand,
    PutMetricAlarmCommand,
} from '@aws-sdk/client-cloudwatch';
import { env } from '../env';
import { AllNetworkConfigs } from '../../modules/network/network-config';
import { DeploymentEnv, WorkerJob } from '../../modules/network/network-config-types';
import { networkContext } from '../../modules/network/network-context.service';
import { secondsPerDay } from '../../modules/common/time';
import { sleep } from '../../modules/common/promise';
import { cronsMetricPublisher, subgraphMetricPublisher } from '../../modules/metrics/metrics.client';

export async function createAlerts(chainId: string): Promise<void> {
    const config = AllNetworkConfigs[chainId];
    await createCronAlertsIfNotExist(chainId, config.workerJobs);

    const subgraphs = Object.entries(config.data.subgraphs).filter(
        ([subgraphName, subgraphUrl]) => subgraphUrl.includes('thegraph') || subgraphUrl.includes('goldsky'),
    );

    const subgraphsToAlert: { subgraphName: string; subgraphUrl: string }[] = [];

    for (const [subgraphName, subgraphUrl] of subgraphs) {
        let subgraphUrlClean = subgraphUrl;
        if (subgraphUrl.includes('gateway')) {
            const parts = subgraphUrl.split('/');
            parts.splice(4, 1);
            subgraphUrlClean = parts.join('/');
        }

        subgraphsToAlert.push({ subgraphName, subgraphUrl: subgraphUrlClean });
    }

    await createSubgraphLagAlertsIfNotExist(chainId, config.data.chain.slug, subgraphsToAlert);
}

async function createCronAlertsIfNotExist(chainId: string, jobs: WorkerJob[]): Promise<void> {
    const ALARM_PREFIX = `CRON ALARM:${chainId}:${env.DEPLOYMENT_ENV}`;

    const cloudWatchClient = new CloudWatchClient({
        region: env.AWS_REGION,
    });

    const alarmNamesToPublish = jobs.map((cronJob) => `${ALARM_PREFIX}:${cronJob.name}`);

    const currentActiveAlarms = await cloudWatchClient.send(
        new DescribeAlarmsCommand({
            AlarmNamePrefix: ALARM_PREFIX,
            MaxRecords: 100,
        }),
    );

    // delete alarms that are not in the current jobs array
    if (currentActiveAlarms.MetricAlarms) {
        const alarmsToDelete: string[] = [];

        for (const alarm of currentActiveAlarms.MetricAlarms) {
            if (alarm.AlarmName && !alarmNamesToPublish.includes(alarm.AlarmName)) {
                alarmsToDelete.push(alarm.AlarmName);
            }
        }
        if (alarmsToDelete.length > 0) {
            await cloudWatchClient.send(new DeleteAlarmsCommand({ AlarmNames: alarmsToDelete }));
        }
    }

    // upsert all other alarms
    for (const cronJob of jobs) {
        const alarmName = `${ALARM_PREFIX}:${cronJob.name}`;

        // set the evaluation period for the alarm to the job interval. Minimum period is 1 minute.
        let periodInSeconds = cronJob.interval / 1000;
        if (periodInSeconds < 60) {
            periodInSeconds = 60;
        }

        let evaluationPeriods = cronJob.alarmEvaluationPeriod ? cronJob.alarmEvaluationPeriod : 3;
        let datapointsToAlarm = cronJob.alarmDatapointsToAlarm ? cronJob.alarmDatapointsToAlarm : 3;

        // AWS Metrics cannot be checked across more than a day (EvaluationPeriods * Period must be <= 86400)
        if (evaluationPeriods * periodInSeconds > secondsPerDay) {
            // if the crons runs in bigger intervalls that once a day, we can't create an alarm
            if (periodInSeconds > 86400) {
                console.error(
                    `Cant create alert for ${cronJob.name} because interval is too big: ${cronJob.interval}ms`,
                );
                continue;
            }
            // if the crons runs once a day or more often, we can set the evaluatioPeriod and dataPointsToAlarm to the highest number possible (2 or 1)
            evaluationPeriods = Math.floor(secondsPerDay / periodInSeconds);
            datapointsToAlarm = Math.floor(secondsPerDay / periodInSeconds);
        }

        //make sure metric is available for alarm
        await cronsMetricPublisher.publish(`${cronJob.name}-${chainId}-done`);

        const putAlarmCommand = new PutMetricAlarmCommand({
            AlarmName: alarmName,
            AlarmDescription: `The cron job ${cronJob.name} should run every ${cronJob.interval / 1000} seconds.
            Triggers alarm if the cron did not run at least once over the last ${
                periodInSeconds * evaluationPeriods
            } seconds.`,
            ActionsEnabled: true,
            AlarmActions: [networkContext.data.monitoring[env.DEPLOYMENT_ENV as DeploymentEnv].alarmTopicArn],
            OKActions: [networkContext.data.monitoring[env.DEPLOYMENT_ENV as DeploymentEnv].alarmTopicArn],
            MetricName: `${cronJob.name}-${chainId}-done`,
            Statistic: 'Sum',
            Dimensions: [{ Name: 'Environment', Value: env.DEPLOYMENT_ENV }],
            // This configures that it will alarm if the cron did not run once over the last three (or configred) intervals
            Period: periodInSeconds,
            Threshold: 1,
            EvaluationPeriods: evaluationPeriods,
            DatapointsToAlarm: datapointsToAlarm,
            ComparisonOperator: 'LessThanThreshold',
            TreatMissingData: 'breaching',
            Namespace: cronsMetricPublisher.namespace,
        });

        await cloudWatchClient.send(putAlarmCommand);
        // rate limits on the AWS API: 3 requests / second
        await sleep(1000);
    }
}

async function createSubgraphLagAlertsIfNotExist(
    chainId: string,
    chainSlug: string,
    subgraphs: { subgraphName: string; subgraphUrl: string }[],
): Promise<void> {
    const ALARM_PREFIX = `SUBGRAPH LAG:${chainId}:${env.DEPLOYMENT_ENV}`;

    const MAX_LAG_ALERT_BLOCK = 1000;
    const EVALUATION_PERIODS = 3;
    const DATAPOINTS_TO_ALARM = 3;
    const EVALUATION_PERIOD = 60 * 5; //5mins

    const cloudWatchClient = new CloudWatchClient({
        region: env.AWS_REGION,
    });

    const alarmNamesToPublish = subgraphs.map((subgraph) => `${ALARM_PREFIX}:${subgraph.subgraphName}`);

    const currentActiveAlarms = await cloudWatchClient.send(
        new DescribeAlarmsCommand({
            AlarmNamePrefix: ALARM_PREFIX,
            MaxRecords: 100,
        }),
    );

    // delete alarms that are not in the current jobs array
    if (currentActiveAlarms.MetricAlarms) {
        const alarmsToDelete: string[] = [];

        for (const alarm of currentActiveAlarms.MetricAlarms) {
            if (alarm.AlarmName && !alarmNamesToPublish.includes(alarm.AlarmName)) {
                alarmsToDelete.push(alarm.AlarmName);
            }
        }
        if (alarmsToDelete.length > 0) {
            await cloudWatchClient.send(new DeleteAlarmsCommand({ AlarmNames: alarmsToDelete }));
        }
    }

    // upsert all other alarms
    for (const subgraph of subgraphs) {
        const alarmName = `${ALARM_PREFIX}:${subgraph.subgraphName}`;
        const metricName = `${chainSlug}-${subgraph.subgraphName}-lag-${subgraph.subgraphUrl}`;

        //make sure metric is available for alarm
        await subgraphMetricPublisher.publish(metricName, 0);

        const putAlarmCommand = new PutMetricAlarmCommand({
            AlarmName: alarmName,
            AlarmDescription: `Subgraph is behind more than ${MAX_LAG_ALERT_BLOCK} blocks for ${
                (EVALUATION_PERIOD * EVALUATION_PERIODS) / 60
            } minutes`,
            ActionsEnabled: true,
            AlarmActions: [networkContext.data.monitoring[env.DEPLOYMENT_ENV as DeploymentEnv].alarmTopicArn],
            OKActions: [networkContext.data.monitoring[env.DEPLOYMENT_ENV as DeploymentEnv].alarmTopicArn],
            MetricName: metricName,
            Statistic: 'Maximum',
            Dimensions: [{ Name: 'Environment', Value: env.DEPLOYMENT_ENV }],
            // This configures that it will alarm if the cron did not run once over the last three (or configred) intervals
            Period: EVALUATION_PERIOD,
            Threshold: MAX_LAG_ALERT_BLOCK,
            EvaluationPeriods: EVALUATION_PERIODS,
            DatapointsToAlarm: DATAPOINTS_TO_ALARM,
            ComparisonOperator: 'GreaterThanThreshold',
            TreatMissingData: 'breaching',
            Namespace: subgraphMetricPublisher.namespace,
        });

        await cloudWatchClient.send(putAlarmCommand);
        // rate limits on the AWS API: 3 requests / second
        await sleep(1000);
    }
}
