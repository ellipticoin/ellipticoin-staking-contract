const _ = require("lodash");
const Bridge = artifacts.require("./Bridge.sol");
const TestToken = artifacts.require("./test/TestToken.sol");
const {
  mint,
} = require("./utils.js");

const {
  balanceOf,
  enter,
  exit,
} = require("./helpers/bridge.js");

contract("Bridge", (accounts) => {
  let contract;
  let token;

  beforeEach(async () => {
    token = await TestToken.new();
    contract = await Bridge.new(token.address)
  });

  describe("#enter", () => {
    it("increases the users balanace", async () => {
      mint(token, {
          [accounts[0]]: 2,
      }, accounts);

      await enter(contract, token, accounts[0], 2);

      assert.equal(await balanceOf(contract, token, accounts[0]), 2);
    });
  });

  describe("#exit", () => {
    it("decreases the user's balance", async () => {
      mint(token, {
          [accounts[0]]: 5,
      }, accounts);

      await enter(contract, token, accounts[0], 5);
      await exit(contract, token, accounts[0], 2);

      assert.equal(await balanceOf(contract, token, accounts[0]), 3);
      assert.equal(await token.balanceOf(accounts[0]), 2);
    });
  });
});
