const ERC4626TAGS_URL =
    'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/erc4626/bufferblocklist.json';

type BufferBlocklist = {
    [chainId: string]: string[];
};

export const getBlockedBuffers = async (): Promise<BufferBlocklist> => {
    const response = await fetch(ERC4626TAGS_URL);
    const bufferBlocklist = (await response.json()) as BufferBlocklist;

    return bufferBlocklist;
};
