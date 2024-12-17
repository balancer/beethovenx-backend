import { GraphQLClient } from 'graphql-request';
import { getSdk, OrderDirection, Validator_OrderBy, ValidatorFragment } from './generated/sts-subgraph-types';

export class StsSubgraphService {
    private sdk: ReturnType<typeof getSdk>;

    constructor(subgraphUrl: string) {
        this.sdk = getSdk(new GraphQLClient(subgraphUrl));
    }

    public async getAllValidators(): Promise<ValidatorFragment[]> {
        const limit = 1000;
        let hasMore = true;
        let validators: ValidatorFragment[] = [];
        let id = '1';

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
}
