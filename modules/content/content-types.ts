import { Chain } from '@prisma/client';
import { GqlChain } from '../../apps/api/gql/generated-schema';

export interface ConfigHomeScreen {
    featuredPoolGroups: HomeScreenFeaturedPoolGroup[];
    newsItems: HomeScreenNewsItem[];
}

export interface HomeScreenFeaturedPoolGroup {
    _key: string;
    _type: string;
    icon: string;
    id: string;
    items: (HomeScreenFeaturedPoolGroupItemPoolId | HomeScreenFeaturedPoolGroupItemExternalLink)[];
    title: string;
}

interface HomeScreenFeaturedPoolGroupItemPoolId {
    _key: string;
    _type: 'homeScreenFeaturedPoolGroupPoolId';
    poolId: string;
}

interface HomeScreenFeaturedPoolGroupItemExternalLink {
    _key: string;
    _type: 'homeScreenFeaturedPoolGroupExternalLink';
    id: string;
    buttonText: string;
    buttonUrl: string;
    image: string;
}

export interface FeaturedPool {
    poolId: string;
    primary: boolean;
    chain: GqlChain;
    description: string;
}

export interface HomeScreenNewsItem {
    id: string;
    timestamp: string;
    source: 'twitter' | 'medium' | 'discord';
    url: string;
    text: string;
    image?: string;
}

export interface ContentService {
    syncTokenContentData(chains: Chain[]): Promise<void>;
    getFeaturedPoolGroups(chains: Chain[]): Promise<HomeScreenFeaturedPoolGroup[]>;
    getFeaturedPools(chains: Chain[]): Promise<FeaturedPool[]>;
    getNewsItems(chain: Chain): Promise<HomeScreenNewsItem[]>;
}
