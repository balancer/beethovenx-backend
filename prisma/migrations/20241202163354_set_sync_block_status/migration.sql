-- This is an empty migration.
INSERT INTO
    "PrismaLastBlockSynced" ("category", "chain", "blockNumber")
SELECT
    'BPT_BALANCES_V2',
    chain,
    "blockNumber"
FROM
    "PrismaUserBalanceSyncStatus"
WHERE
    type = 'WALLET';

-- Delete duplicated wallet balances
DELETE FROM
    "PrismaUserWalletBalance"
WHERE
    LENGTH(id) = 85;

UPDATE
    "PrismaUserWalletBalance"
SET
    id = "tokenAddress" || '-' || "userAddress";