import * as sources from './sources';
import { YbAprConfig } from '../../../../network/apr-config-types';
import { Chain } from '@prisma/client';
import { AprHandler, AprHandlerConstructor, TokenApr } from './types';
export type { AprHandler, AprHandlerConstructor, TokenApr };

const sourceToHandler = {
    aave: sources.AaveAprHandler,
    beefy: sources.BeefyAprHandler,
    bloom: sources.BloomAprHandler,
    sftmx: sources.SftmxAprHandler,
    // euler: sources.EulerAprHandler, // Removed, pools rekt
    // gearbox: sources.GearboxAprHandler, // Removed, endpoint is down
    // idle: sources.IdleAprHandler, // Removed, endpoint is down
    maker: sources.MakerAprHandler,
    ovix: sources.OvixAprHandler,
    // reaper: sources.ReaperCryptAprHandler, // Removed, pools rekt
    tetu: sources.TetuAprHandler,
    tranchess: sources.TranchessAprHandler,
    yearn: sources.YearnAprHandler,
    defaultHandlers: sources.DefaultAprHandler,
    stakewise: sources.Stakewise,
    maple: sources.Maple,
    yieldnest: sources.Yieldnest,
    etherfi: sources.Etherfi,
    // sveth: sources.svEthAprHandler, // Savvy migrated to arbitrum
    dforce: sources.DForce,
    defillama: sources.Defillama,
    teth: sources.TreehouseAprHandler,
};

export class YbAprHandlers {
    private handlers: AprHandler[] = [];
    fixedAprTokens?: { [tokenName: string]: { address: string; apr: number; group?: string; isIbYield?: boolean } };

    constructor(aprConfig: YbAprConfig, private chain?: Chain) {
        const { fixedAprHandler, ...config } = aprConfig;
        this.handlers = this.buildAprHandlers(config);
        this.fixedAprTokens = fixedAprHandler;
    }

    private buildAprHandlers(aprConfig: YbAprConfig) {
        const handlers: AprHandler[] = [];

        // Add handlers from global configuration
        for (const [source, config] of Object.entries(aprConfig)) {
            const Handler = sourceToHandler[source as keyof typeof sourceToHandler];

            // Ignore unknown sources
            if (!Handler) {
                continue;
            }

            // Handle nested configs
            if (source === 'aave' || source === 'defaultHandlers') {
                for (const nestedConfig of Object.values(config)) {
                    handlers.push(new Handler(nestedConfig as any));
                }
            } else {
                handlers.push(new Handler(config));
            }
        }

        // Add handlers from self-configured sources
        Object.values(sources as unknown as any[])
            .filter((source): source is { chains: Chain[]; Handler: AprHandlerConstructor } => 'chains' in source)
            .filter((source) => this.chain && source.chains.includes(this.chain))
            .forEach((source) => {
                handlers.push(new source.Handler());
            });

        return handlers;
    }

    async fetchAprsFromAllHandlers(): Promise<TokenApr[]> {
        let aprs: TokenApr[] = this.fixedAprTokens
            ? Object.values(this.fixedAprTokens).map(({ address, apr, isIbYield, group }) => ({
                  apr,
                  address,
                  isIbYield: isIbYield ?? false,
                  group,
              }))
            : [];

        const results = await Promise.allSettled(this.handlers.map((handler) => handler.getAprs(this.chain)));

        for (const result of results) {
            if (result.status === 'fulfilled') {
                aprs = aprs.concat(
                    Object.entries(result.value).map(([address, { apr, isIbYield, group }]) => ({
                        apr,
                        address,
                        isIbYield,
                        group,
                    })),
                );
            } else {
                console.error('Failed to fetch APRs from handler', result.reason);
            }
        }

        return aprs;
    }
}
