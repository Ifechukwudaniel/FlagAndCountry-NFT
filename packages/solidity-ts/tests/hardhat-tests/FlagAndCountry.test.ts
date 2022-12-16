import '~helpers/hardhat-imports';
import '~tests/utils/chai-imports';

import { expect } from 'chai';
import hre from 'hardhat';

import { FlagAndCountry, FlagAndCountry__factory } from '~common/generated/contract-types';
import { getHardhatSigners } from '~helpers/functions/accounts';

describe('Flag And  Country Nft 🤓', function () {
  this.timeout(180000);

  // console.log("hre:",Object.keys(hre)) // <-- you can access the hardhat runtime env here

  describe('Flag An Country', function () {
    let flagAndCountry: FlagAndCountry;

    describe('mintFlag()', function () {
      beforeEach(async () => {
        const { deployer } = await getHardhatSigners(hre);
        const factory = new FlagAndCountry__factory(deployer);
        flagAndCountry = await factory.deploy();
      });

      it('Should be able to mint an flag NFT', async function () {
        const { user1 } = await getHardhatSigners(hre);

        console.log('\t', ' 🧑‍🏫 Tester Address: ', user1.address);

        const startingBalance = await flagAndCountry.balanceOf(user1.address);
        console.log('\t', ' ⚖️ Starting balance: ', startingBalance.toNumber());

        console.log('\t', ' 🔨 Minting...');
        const mintResult = await flagAndCountry.mintFlag(user1.address);
        console.log('\t', ' 🏷  mint tx: ', mintResult.hash);

        console.log('\t', ' ⏳ Waiting for confirmation...');
        const txResult = await mintResult.wait(1);
        expect(txResult.status).to.equal(1);

        console.log('\t', ' 🔎 Checking new balance: ', startingBalance.toNumber());
        expect(await flagAndCountry.balanceOf(user1.address)).to.equal(startingBalance.add(1));
      });

      it('should  not be able to mint more than 250 Nft', async () => {
        const { user1 } = await getHardhatSigners(hre);

        for (let i = 0; i < 250; i++) {
          const mintResult = await flagAndCountry.mintFlag(user1.address);
          const txResult = await mintResult.wait(1);
          expect(txResult.status).to.equal(1);
          console.log('\t', ' 🏷  mint tx: ', mintResult.hash, `${i}`, (await flagAndCountry.totalSupply()).toNumber());
        }
        await expect(flagAndCountry.mintFlag(user1.address)).to.be.revertedWith('The maximum supply is 250');
      });
    });
  });
});
