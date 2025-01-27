import { TokenPriceHandler } from '../../token-types';
import { PrismaTokenWithTypes } from '../../../../prisma/prisma-types';
import { timestampRoundedUpToNearestHour } from '../../../common/time';
import { updatePrices } from './price-handler-helper';
import _ from 'lodash';

const LQDR = '0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9';

export class RektTokensHandlerService implements TokenPriceHandler {
    public readonly exitIfFails = false;
    public readonly id = 'RektTokensHandlerService';

    private getAcceptedTokens(tokens: PrismaTokenWithTypes[]) {
        return tokens.filter((token) => token.address === LQDR);
    }

    public async updatePricesForTokens(tokens: PrismaTokenWithTypes[]) {
        const timestamp = timestampRoundedUpToNearestHour();
        const acceptedTokens = this.getAcceptedTokens(tokens);
        const tokenAndPrices = acceptedTokens.map((token) => ({
            address: token.address,
            chain: token.chain,
            price: 0,
        }));

        await updatePrices(this.id, tokenAndPrices, timestamp);
        return acceptedTokens;
    }
}
