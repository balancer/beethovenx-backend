import { utils } from 'ethers';
import beetsAbi from '../abi/BeethovenxToken.json';
import { getContractAt } from '../../web3/contract';
import fantom from '../../../config/fantom';

const NON_CIRCULATING_ADDRESSES = [
    '0xa2503804ec837d1e4699932d58a3bdb767dea505', //team linear vesting
    '0x0edfcc1b8d082cd46d13db694b849d7d8151c6d5', //team multisig
    '0x8d381ec09356c3f1805c54b2bb0867e8b417dc3a', //balancer dao linear vesting
    '0xFe2022da08d17ac8388F5bEFE4F71456255105A4', //balancer dao multisig
    '0xa1e849b1d6c2fd31c63eef7822e9e0632411ada7', //treasury multisig
    '0x69739a7618469eed0685330d164d50ac19a9411a', //strategic partnership multisig
    '0x766ddc12447973d86092e403f85c35578dd0433d', //advisor linear vesting
];

export async function beetsGetCirculatingSupply() {
    const beetsContract = getContractAt(fantom.beets!.address, beetsAbi);

    let totalSupply = await beetsContract.totalSupply();

    for (const address of NON_CIRCULATING_ADDRESSES) {
        const balance = await beetsContract.balanceOf(address);
        totalSupply = totalSupply.sub(balance);
    }

    return utils.formatUnits(totalSupply);
}
