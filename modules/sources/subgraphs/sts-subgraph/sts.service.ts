import { GraphQLClient } from 'graphql-request';
import {
    getSdk,
    OrderDirection,
    SonicStakingSnapshot_OrderBy,
    SonicStakingSnapshotFragment,
    Validator_OrderBy,
    ValidatorFragment,
} from './generated/sts-subgraph-types';

export class StsSubgraphService {
    private sdk: ReturnType<typeof getSdk>;

    constructor(subgraphUrl: string) {
        this.sdk = getSdk(new GraphQLClient(subgraphUrl));
    }

    public async getAllValidators(): Promise<ValidatorFragment[]> {
        const limit = 1000;
        let hasMore = true;
        let validators: ValidatorFragment[] = [];
        let id = '0';

        while (hasMore) {
            const response = await this.sdk.Validators({
                where: { id_gt: id },
                orderBy: Validator_OrderBy.id,
                orderDirection: OrderDirection.asc,
                first: limit,
            });

            validators = [...validators, ...response.validators];

            if (response.validators.length < limit) {
                hasMore = false;
            } else {
                id = response.validators[response.validators.length - 1].id;
            }
        }

        return validators;
    }

    public async getAllStakingSnapshots(): Promise<SonicStakingSnapshotFragment[]> {
        const limit = 1000;
        let hasMore = true;
        let sonicStakingSnapshots: SonicStakingSnapshotFragment[] = [];
        let id = '0x';

        while (hasMore) {
            const response = await this.sdk.SonicStakingSnapshots({
                where: { id_gt: id },
                orderBy: SonicStakingSnapshot_OrderBy.id,
                orderDirection: OrderDirection.asc,
                first: limit,
            });

            sonicStakingSnapshots = [...sonicStakingSnapshots, ...response.sonicStakingSnapshots];

            if (response.sonicStakingSnapshots.length < limit) {
                hasMore = false;
            } else {
                id = response.sonicStakingSnapshots[response.sonicStakingSnapshots.length - 1].id;
            }
        }

        return sonicStakingSnapshots;
    }

    public async getStakingSnapshotsAfter(timestamp: number): Promise<SonicStakingSnapshotFragment[]> {
        const limit = 1000;
        let hasMore = true;
        let sonicStakingSnapshots: SonicStakingSnapshotFragment[] = [];
        let queryTimestamp = timestamp;

        while (hasMore) {
            const response = await this.sdk.SonicStakingSnapshots({
                where: { snapshotTimestamp_gt: queryTimestamp },
                orderBy: SonicStakingSnapshot_OrderBy.snapshotTimestamp,
                orderDirection: OrderDirection.asc,
                first: limit,
            });

            sonicStakingSnapshots = [...sonicStakingSnapshots, ...response.sonicStakingSnapshots];

            if (response.sonicStakingSnapshots.length < limit) {
                hasMore = false;
            } else {
                queryTimestamp =
                    response.sonicStakingSnapshots[response.sonicStakingSnapshots.length - 1].snapshotTimestamp;
            }
        }

        return sonicStakingSnapshots;
    }
}
