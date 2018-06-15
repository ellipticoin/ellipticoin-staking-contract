const _ = require("lodash");
const Depositable = artifacts.require("./Depositable.sol");
const TestToken = artifacts.require("./test/TestToken.sol");
const {
  mint,
} = require("./utils.js");
const {
  deposit,
  balanceOf,
  withdraw,
} = require("./helpers/depositable.js");

contract("Depositable", (accounts) => {
  let contract;
  let token;

  beforeEach(async () => {
    token = await TestToken.new();
    contract = await Depositable.new(token.address)
  });

  describe("#totalStake", () => {
    it("sums the deposits", async () => {
      mint(token, {
          [accounts[0]]: 2,
          [accounts[1]]: 3,
      }, accounts);

      await deposit(contract, accounts[0], 2);
      await deposit(contract, accounts[1], 3);

      assert.equal((await contract.totalStake.call()).toNumber(), 5);
    });
  });

  describe("#deposit", () => {
    it("increases the user's balance", async () => {
      mint(token, {
          [accounts[0]]: 2,
      }, accounts);

      await deposit(contract, accounts[0], 2);

      assert.equal(await balanceOf(contract, accounts[0]), 2);
    });
  });

  describe("#withdraw", () => {
    it("decreases the user's balance", async () => {
      mint(token, {
          [accounts[0]]: 5,
      }, accounts);

      await deposit(contract, accounts[0], 5);
      await withdraw(contract, accounts[0], 2);

      assert.equal(await balanceOf(contract, accounts[0]), 3);
      assert.equal(await balanceOf(token, accounts[0]), 2);
    });

    it("removes the user if their balance is 0", async () => {
      mint(token, {
          [accounts[0]]: 5,
      }, accounts);

      await deposit(contract, accounts[0], 5);
      await withdraw(contract, accounts[0], 5);

      assert.equal((await contract.addressesLength()).toNumber(), 0);
    });
  });
});
