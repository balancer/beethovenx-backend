import { beetsGetCirculatingSupply, beetsGetCirculatingSupplySonic } from '../../modules/beets/lib/beets';

test('retrieve updated fBeets ratio', async () => {
    const fantomCirc = await beetsGetCirculatingSupply();

    console.log(fantomCirc);

    const sonicCirc = await beetsGetCirculatingSupplySonic();

    console.log(sonicCirc);
});
