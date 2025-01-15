export async function subgraphLoadAll<T>(
    request: (variables: any) => Promise<any>,
    resultKey: string,
    args: any,
    maxPages = 5,
): Promise<T[]> {
    let all: any[] = [];
    const limit = 1000;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
        const response = await request({
            ...args,
            first: limit,
            skip,
        });

        all = [...all, ...response[resultKey]];
        skip += limit;
        hasMore = response[resultKey].length === limit;

        //TODO: rip this out asap
        if (maxPages > 0 && skip > maxPages * 1000) {
            console.log('BAILING EARLY FROM A subgraphLoadAll', resultKey, args);
            break;
        }
    }

    return all;
}
