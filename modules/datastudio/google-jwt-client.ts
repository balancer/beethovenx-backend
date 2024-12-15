import * as google from 'googleapis-common';
import { env } from '../../apps/env';
import { JWT } from 'google-auth-library';
import { DeploymentEnv } from '../network/network-config-types';
import config from '../../config';
import { Chain } from '@prisma/client';

export class GoogleJwtClient {
    public async getAuthorizedSheetsClient(privateKey: string, chain: Chain): Promise<JWT> {
        const jwtClient = new google.JWT(
            config[chain].datastudio![env.DEPLOYMENT_ENV as DeploymentEnv].user,
            undefined,
            privateKey,
            'https://www.googleapis.com/auth/spreadsheets',
        );
        jwtClient.authorize(function (err, result) {
            if (err) {
                console.log(`Error authorizing google jwt client: ${err}`);
            }
        });
        return jwtClient;
    }
}

export const googleJwtClient = new GoogleJwtClient();
