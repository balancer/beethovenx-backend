// stablePoolFactory.ts
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { Token, TokenAmount } from '@balancer/sdk';
import { Chain } from '@prisma/client';
import { parseEther, parseUnits, Address } from 'viem';
import { TokenPairData } from '../../../modules/sources/contracts/v3/fetch-tokenpair-data';
import { StablePool } from '../../../modules/sor/sorV2/lib/poolsV3';
import { StableBasePoolToken } from '../../../modules/sor/sorV2/lib/poolsV3/stable/stableBasePoolToken';
import { LiquidityManagement } from '../../../modules/sor/types'; 
import { HookState } from '@balancer-labs/balancer-maths';


export const StablePoolFactory = Factory.define<StablePool>(({ params }) => {
    const chain: Chain = params.chain || faker.helpers.arrayElement<Chain>(['MAINNET', 'SEPOLIA']);
    const id = params.id || (faker.finance.ethereumAddress() as Address);
    const address = params.address || id;
    const amp = params.amp || parseUnits(faker.number.int({ min: 1, max: 500 }).toString(), 3);
    const swapFee = params.swapFee || parseEther(faker.number.float({ min: 0.0001, max: 0.01 }).toString());
    const totalShares = params.totalShares || parseEther(faker.number.int({ min: 1000, max: 1000000 }).toString());
    const hookState = params.hookState ?? null;
    const liquidityManagement = params.liquidityManagement ?? {
        disableUnbalancedLiquidity: false,
        enableAddLiquidityCustom: false,
        enableDonation: false,
        enableRemoveLiquidityCustom: false,
    };

    const tokens =
        params.tokens ||
        Array.from({ length: 3 }, (_, index) => {
            const token = new Token(
                parseFloat(faker.number.int({ min: 1, max: 1000 }).toString()),
                faker.finance.ethereumAddress() as Address,
                18,
                faker.finance.currencyCode(),
                faker.finance.currencyName(),
            );
            const tokenAmount = TokenAmount.fromHumanAmount(token, `${faker.number.int({ min: 1000, max: 1000000 })}`);
            return new StableBasePoolToken(
                token,
                tokenAmount.amount,
                index,
                parseEther(faker.number.float({ min: 0.9, max: 1.1 }).toString()),
            );
        });

    const tokenPairs: TokenPairData[] =
        params.tokenPairs ||
        tokens.map((token) => ({
            tokenA: token.token.address,
            tokenB: tokens[0].token.address,
            normalizedLiquidity: faker.number.int({ min: 1000, max: 1000000 }).toString(),
            spotPrice: faker.number.int({ min: 1, max: 1000 }).toString(),
        }));

    return new StablePool(id, address, chain, amp, swapFee, tokens, totalShares, tokenPairs, liquidityManagement as LiquidityManagement, hookState as HookState);
});
