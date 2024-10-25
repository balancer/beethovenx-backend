# backend

## 1.21.12

### Patch Changes

-   27bb15a: fix: add an update to "totalSharesNum" column
-   d021220: change reth apr source
-   ade5959: adding surplus and swap APR based on 7d and 30d values
-   9794d8d: refactor pool transformers, add scaling factors
-   d71162a: fix: sync cow amm balances on adding new pools
-   6bc68c9: adding balance fetching margin
-   92cb5a4: update cow amm subgraphs
-   af45007: add new fantom subgraph version
-   6bf00c8: fix erc4626 data fetching
-   4190058: fix: adding missing bpt token records
-   6f18aab: update sepolia blocks subgraph and vault v3 abis
-   a4f6220: use 10th deployment of v3
-   303f3e0: fix: overwriting of subgraph data
-   2afa4ba: changing sepolia blocks SG
-   51aeb1c: expose bias and slope in vebal user snapshots

## 1.21.11

### Patch Changes

-   6d70678: sync vebal user snapshots
-   5249d64: fix SOR raw amounts

## 1.21.10

### Patch Changes

-   025c43d: limit db data over-reading for batch swaps query (beets)

## 1.21.9

### Patch Changes

-   0cf158a: remove yearn apr from fantom

## 1.21.8

### Patch Changes

-   7df8cc6: fixing user sync balance for reliquary positions
-   4a46b01: allow searching by pool ID
-   1962da6: add enrichments to aggregator query
-   eabb550: dvstETH-APR-mainnet
-   a529b35: track last synced block for v3
-   a5b85ad: 9th v3 deployment

## 1.21.7

### Patch Changes

-   a159cc9: fix hardcoded protocolVersion return value in SOR paths
-   127142c: fix protocol metrics

## 1.21.6

### Patch Changes

-   4bd3844: rename polygon native asset from MATIC to POL
-   33bac59: Add stataAvaWAVAX2 APR hanlder
-   9d8e6de: add scalingfactor, liquidity mangement and default filters to aggregator query
-   716e7f0: move swap service to actions
-   92adb18: fix paused state parsing issue
-   f613949: change hook filter to bool
-   ebc0eaf: feat: allow stable pool routing for v3
-   a7ed429: adding wUSDL apr on arbitrum

## 1.21.5

### Patch Changes

-   fd5ea37: multicall request size tuning
-   c0fc647: fix balance calculation

## 1.21.4

### Patch Changes

-   90bc31a: fix pool token price query

## 1.21.3

### Patch Changes

-   e33ff3a: populate prismaPoolSwap table until everything is migrated

## 1.21.2

### Patch Changes

-   8532816: update cow subgraph on other chains

## 1.21.1

### Patch Changes

-   3c6840e: make v2 sync work with nested pool creation in the same block
-   a6e8e1a: update cow subgraph for mainnet

## 1.21.0

### Minor Changes

-   19abfd7: adding liquidity management json
-   56b06a5: adding pool actions for v2

### Patch Changes

-   8aacde1: use cow_amm type selector for syncing actions
-   e96b9be: use bigint in tokenpair sync
-   056c32d: fix weth address for sepolia
-   462b6d9: add liquidity mangement to pool list query
-   39f2e4a: enable v2 syncs for sepolia

## 1.20.10

### Patch Changes

-   53d8445: sync all token metadata from tokenlist

## 1.20.9

### Patch Changes

-   44ca026: gyro config on avax

## 1.20.8

### Patch Changes

-   64e55d4: add defillama yields as an APR adapter
-   07e1f17: Fix Gyro2CLPPool implementations to account for token rates during swaps.

## 1.20.7

### Patch Changes

-   5419dc5: avax subgraph deployment update
-   bcd8189: Handle parsing errors causing the app to crash

## 1.20.6

### Patch Changes

-   0cb9214: adding Aave lUSD and crvUSD APRs
-   1c9aa5b: use default rpc url for fetching svEth APR data
-   a0d5b42: use subgraph deployment if for zkevm
-   dd3e100: Enable sdBal stable pool.

## 1.20.5

### Patch Changes

-   0ab785d: fetch token rates for gyro2 pools

## 1.20.4

### Patch Changes

-   14b6f71: adding aura balance tracking to fraxtal
-   3fb6c32: change RPCs to dRPC

## 1.20.3

### Patch Changes

-   6c67ceb: SOR shouldn't be using all static pools
-   c64e675: handle queryBatchSwap errors
-   6c67ceb: add sync latest fx prices as a task

## 1.20.2

### Patch Changes

-   2a486d0: fixing prisma include issue in updateAllTokenPrices

## 1.20.1

### Patch Changes

-   c8913ca: Enable Stable pools for non-V3 in SOR.

## 1.20.0

### Minor Changes

-   9d9b90d: Subgraph client will fallback to another URL on failure

### Patch Changes

-   d813678: dev setup with hot reloading
-   5ea8f51: adding prodction base subgraph url
-   7f76312: AAVE APRs on gnosis and wUSDM on OP

## 1.19.0

### Minor Changes

-   db7314d: add hook type name, handle swap amount = 0 errors
-   46704ef: updating V3 vault deployment to v8 on sepolia

## 1.18.0

### Minor Changes

-   a6b5027: update protocol revenue APR to usdc

### Patch Changes

-   dac4636: prevent common issues from being sent to sentry
-   1516a1b: handle SOR's effective price when outputAmount is 0

## 1.17.0

### Minor Changes

-   8257bdd: organising apps and updating sentry
-   37d9161: cow amm on arbitrum

### Patch Changes

-   f0f4deb: make return values in GqlSorPath required
-   6baafda: Report missing tokens for active rewards only

## 1.16.0

### Minor Changes

-   04a202e: adding reward token data to apr item

### Patch Changes

-   4b3aa1e: add reward token to yb and nested apr
-   d61718a: adding new pool query specific for aggregator needs
-   420ff5f: refactoring VotingGaugesRepository to use viem

## 1.15.0

### Minor Changes

-   7f6a2bf: adding maker and renzo APRs on Mode

## 1.14.8

### Patch Changes

-   ac4ff07: make queries to use wallet indexes properly

## 1.14.7

### Patch Changes

-   039f01b: use index when querying events by userAddress

## 1.14.6

### Patch Changes

-   271c9ae: optimise main events query index

## 1.14.5

### Patch Changes

-   07d60a7: cleaup event indexes

## 1.14.4

### Patch Changes

-   cc9899d: skip sftmx vaults that are 0x0

## 1.14.3

### Patch Changes

-   bf14fb9: associate gauge balances on pool addresses

## 1.14.2

### Patch Changes

-   0e599cb: adding event query logging to triage db issues

## 1.14.1

### Patch Changes

-   5b8e7d5: fix cow amm event syncing

## 1.14.0

### Minor Changes

-   1545310: SOR - Add support for paths with buffers/boosted pools

### Patch Changes

-   62baccf: make sure cow amm balances are added for new pools
-   03f81ff: add aFRAX APR
-   d9ebb9a: handle streamed BAL on mainnet properly
-   d87f76e: Dont show MERKL APR if it has a whitelist

## 1.13.0

### Minor Changes

-   ce47937: adding cow amm SG balance syncing

## 1.12.0

### Minor Changes

-   2141ceb: APR source for yieldnest ETH (ynETH)

### Patch Changes

-   93e44ae: add agETH APR for mainnet
-   b381a08: committing generate graphql schemas

## 1.11.1

### Patch Changes

-   b0eef3d: flatten the event type in the events query

## 1.11.0

### Minor Changes

-   570a67b: adding a query for getting multichain vebal balances

### Patch Changes

-   9f7d395: add merkl, voting and locking as incentivized pool
-   e0fa5d8: Prune records with zero values in balance tables
-   ddf8be9: filtering events by value in USD
-   ed9747b: adding relative weigth to the voting list query

## 1.10.0

### Minor Changes

-   ad09bfd: susx and usdm APRs on Arb
-   5a023cb: adding support for hooks
-   aae66a9: cdcETH APR

### Patch Changes

-   5ec208f: Fix scientific notation issue caused by parseFloat
-   8a7c851: Adding aggregate fee fields to pools dynamic data
-   01a1b1a: accept any letter casing in queries
-   6782183: SOR - Replace parseFloat with parseEther

## 1.9.3

### Patch Changes

-   cd94cd1: Using API prices to calculate totalLiquidity in snapshots
-   31d93a1: passing protocol version to sor lib

## 1.9.2

### Patch Changes

-   aff6246: update env file

## 1.9.1

### Patch Changes

-   a3ab47e: workaround for streamed BAL on mainnet

## 1.9.0

### Minor Changes

-   ad5c843: Add support for SOR paths with add/remove liquidity steps

### Patch Changes

-   ff80266: adding mutation to reload erc4626
-   0cb2dbb: quick workaround to remove cow apr boost

## 1.8.3

### Patch Changes

-   29f0beb: using pool addresses to match gauges instead of pool id

## 1.8.2

### Patch Changes

-   55fa750: SOR should consider STABLE pools for v3 liquidity only

## 1.8.1

### Patch Changes

-   7d327cf: fix token query

## 1.8.0

### Minor Changes

-   7720c09: add support for boosted pools for v3

### Patch Changes

-   116cf21: expose surplus in the events query
-   421a48e: Refactor SOR to use Balancer Maths for v3 liquidity

## 1.7.4

### Patch Changes

-   1d3f265: v2 update interferes with cow

## 1.7.3

### Patch Changes

-   af11d6b: fix cow-surplus scaling, update cow volume sync

## 1.7.2

### Patch Changes

-   13f2416: update cow amm subgraphs
-   956f28c: update masterchef subgraph

## 1.7.1

### Patch Changes

-   e102809: stakewise gnosis and maple syrup APRs

## 1.7.0

### Minor Changes

-   0847dd4: syncing pool type specific data

### Patch Changes

-   af4417e: updated AAVE subgraph URLs for getting token APRs
-   b08fa1e: update cow subgraphs
-   b20c5fd: sync tokenlist for sepolia

## 1.6.3

### Patch Changes

-   72cc583: add weETH APR on Arb and rETH APR on Gnosis

## 1.6.2

### Patch Changes

-   07fcf6a: fixed surplus APR calculation
-   a72b08f: move rpcs from infura to alchemy

## 1.6.1

### Patch Changes

-   0627776: fixed sdai yield on fraxtal

## 1.6.0

### Minor Changes

-   f9d50e4: syncing holders could on changed cow-amm pools

### Patch Changes

-   5f6fd67: handle failing aave pricing

## 1.5.5

### Patch Changes

-   3f08512: subgraph patch

## 1.5.4

### Patch Changes

-   5c02fa1: new cow-subgraphs, add weights to cow-pools, add reload mutation
-   0959978: fix snapshot loading for cow
-   ede18b9: fixed double execution of the merkl job
-   6a8d02e: add aave wrapped tokens to sepolia handler
-   fec4cac: Fix cow user balances
-   975e058: fix token rate and config sync for v3, add reload mutation

## 1.5.3

### Patch Changes

-   22bc735: Update cow-amm subgraphs, add gnosis

## 1.5.2

### Patch Changes

-   c31cef8: new cow amm subgraph, fix surplus calc
-   d72fec7: fix scaling for cow pool data

## 1.5.1

### Patch Changes

-   40631b9: change fantom rpc
-   0fd0952: change cow amm subgraph to deployment id
-   64cdecc: more robust aura sync
-   4cfbf0e: add gUSDC apr

## 1.5.0

### Minor Changes

-   ed09091: split controllers, reload also syncs pool state

### Patch Changes

-   846b2ad: allow test env to use paid rpc
-   0b421c5: fix exact_out with getBestSwapPathVersion
-   2dbbb7c: fix initial cow amm sync
-   2366ee3: add cow crons to mainnet and adapt cron intervalls
-   f12b5b2: fix initUserBalances for local runs

## 1.4.3

### Patch Changes

-   43735c9: fix sfrax apr on fraxtal

## 1.4.2

### Patch Changes

-   3613c9f: reduce multicall batch size

## 1.4.1

### Patch Changes

-   6daa985: smaller chunks for pool fetching

## 1.4.0

### Minor Changes

-   d4caec8: Cow AMM aprs calculated from daily surplus

### Patch Changes

-   812bdba: return filename only for rateprovider review

## 1.3.2

### Patch Changes

-   6429e7a: Adding new pool filter tags tagIn and tagNotIn. These replace categoryIn/categoryNotIn removing enum constraint.
-   f816e93: changed the events query ordering from blockNumber to blockTimestamp to mitigate different chain height.
-   21da677: adding gyro config on gnosis chain
-   8389be2: using pool instead of global variables in ybTokenService
-   34a7a8c: fix aura and gauge user balance sync
-   5604fd9: exposing tags
-   57bbc2a: fix tracking of balance if last relic was transferred

## 1.3.1

### Patch Changes

-   95b752f: fixing missing files in metadata repo
-   480c22c: add cache to db query in SOR
-   2dc67f1: fix fantom blocks subgraph url

## 1.3.0

### Minor Changes

-   331c657: adding metadata categories from the github repo
-   2b1cbec: adding merkl reward aprs

### Patch Changes

-   4009872: adding missing fields to rate provider reviews
-   7397078: use subgraph deployment IDs instead of subgraph id
-   76c8176: Exclude current round from HiddenHand APRs
-   cbea2e0: limiting events query results set to 1000 records
-   bccc7a5: adding indexes to token related tables
-   614383b: breaking - making events query filter optional and allowing multiple chains

## 1.2.0

### Minor Changes

-   d8752b4: adding vebal as a staking option

### Patch Changes

-   b03f0ce: fix aura apr scaling
-   b3aedfc: Increase swap size to 100 USD for normalized liquidity calculation. Also only use pools that have >=1000USD tvl
-   e8e8bcc: adding SOR support for vault v3 - swaps only
-   ddb3616: moving snapshot syncing to a separate functions
-   e643603: updated AAVE subgraph URLs for getting token APRs
-   b071980: adding backsyncing task for filling up subgraph swaps
-   abc67d0: exposing aura pool id and shutdown flag for aura staking

## 1.1.0

### Minor Changes

-   a7711cb: Adding incentivized field to the pool response type
-   7fcea18: add cow-amm support for swaps, add, removes and snapshots. Also incorporate surplus

### Patch Changes

-   deb7c03: adjust syncs to newest vault v3 version
-   455bb0b: rename join/exit to add/remove for v3 subgraph
-   755e873: config fix
-   95e5636: fix: removing renamed vaultVersion column
-   4465dbf: adding poolToken -> balanceUSD
-   798c947: adding chain and user address as query params to vebal queries
-   0851e56: Update to newest v3 subgraph. Adjust balances etc from wei to floats
-   8961dfb: handle missing tokens in subgraph pools
-   1021114: fix voting apr timestamp to use UTC
-   489cf3e: removing duplicated vebal locks subgraph url

## 1.0.1

### Patch Changes

-   07a7fc9: make the workflow manual

## 1.0.0

### Major Changes

-   30b1148: First release of the Balancer backend / api v3

    This marks the first release for the API v3. With the release of ZEN, the following queries are deprecated and shall not be used anymore:

    -   poolGetSwaps
    -   poolGetBatchSwaps
    -   poolGetJoinExits
    -   poolGetFeaturedPoolGroups
    -   tokenGetPriceChartData
    -   tokenGetCandlestickChartData
    -   tokenGetTokenData
    -   tokenGetTokensData
    -   tokenGetProtocolTokenPrice

    The following fields and types are deprecated:

    -   vaultVersion
    -   investConfig
    -   GqlPoolInvestConfig
    -   GqlPoolInvestOption
    -   withdrawConfig
    -   GqlPoolWithdrawConfig
    -   GqlPoolWithdrawOption
    -   apr
    -   GqlPoolApr
    -   GqlPoolAprValue
    -   GqlPoolAprRange
    -   GqlPoolAprTotal
    -   tokens
    -   GqlPoolNestedUnion
    -   GqlPoolTokenComposableStableNestedUnion
    -   GqlPoolTokenBase
    -   GqlPoolToken
    -   GqlPoolTokenComposableStable

    See the gql files to find the suitable replacements.

### Minor Changes

-   34a7d70: update sftmx vaults when they are matured
