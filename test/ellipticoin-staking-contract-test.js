const _ = require("lodash");
const web3 = require("web3");
const EllipitcoinStakingContract = artifacts.require("./EllipitcoinStakingContract.sol");
const TestToken = artifacts.require("./TestToken.sol");

contract('EllipitcoinStakingContract', (accounts) => {
  let contract;
  let token;

  beforeEach(async () => {
    token = await TestToken.deployed();
    contract = await EllipitcoinStakingContract.new(token.address)
  })

  describe.only("#totalStake", () => {
    it("increases when deposits are made", async () => {
      await token.mint(accounts[0], 2);
      await token.mint(accounts[1], 3);
      await token.finishMinting();

      await token.approve(contract.address, 2, {
        from: accounts[0],
      });

      await token.approve(contract.address, 3, {
        from: accounts[1],
      });

      await contract.deposit(2, {
        from: accounts[0],
      });

      await contract.deposit(3, {
        from: accounts[1],
      });

      assert.equal((await contract.totalStake.call()).toNumber(), 5);
    });
  });
});
