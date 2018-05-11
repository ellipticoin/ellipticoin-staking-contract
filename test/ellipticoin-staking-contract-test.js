const _ = require("lodash");
const web3 = require("web3");
const EllipitcoinStakingContract = artifacts.require("./EllipitcoinStakingContract.sol");
const TestToken = artifacts.require("./TestToken.sol");

contract('EllipitcoinStakingContract', (accounts) => {
  let contract;
  let token;

  beforeEach(async () => {
    token = await TestToken.new();
    contract = await EllipitcoinStakingContract.new(token.address)
  })

  describe("#totalStake", () => {
    it("sums the deposits", async () => {
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

  describe("#deposit", () => {
    it("increases the user's balance", async () => {
      await token.mint(accounts[0], 2);
      await token.finishMinting();
      await token.approve(contract.address, 2, {
        from: accounts[0],
      });
      await contract.deposit(2, {
        from: accounts[0],
      });
      assert.equal((await contract.balances.call(accounts[0])).toNumber(), 2);
    });
  });

  describe("#withdraw", () => {
    it("decreases the user's balance", async () => {
      await token.mint(accounts[0], 5);
      await token.finishMinting();
      await token.approve(contract.address, 5, {
        from: accounts[0],
      });
      await contract.deposit(5, {
        from: accounts[0],
      });

      await contract.withdraw(2, {
        from: accounts[0],
      });
      assert.equal((await contract.balances.call(accounts[0])).toNumber(), 3);
      assert.equal((await token.balanceOf(accounts[0])).toNumber(), 2);
    });

    it("removes the user if their balance is 0", async () => {
      await token.mint(accounts[0], 5);
      await token.finishMinting();
      await token.approve(contract.address, 5, {
        from: accounts[0],
      });
      await contract.deposit(5, {
        from: accounts[0],
      });

      await contract.withdraw(5, {
        from: accounts[0],
      });
      assert.equal((await contract.addressesLength()).toNumber(), 0);
    });
  });
});
