const _ = require("lodash");
const Bridge = artifacts.require("./Bridge.sol");
const TestToken = artifacts.require("./test/TestToken.sol");
const {
  assertFailure,
  vmError,
  mint,
} = require("./utils.js");

const {
  enter,
} = require("./helpers/bridge.js");

contract("Bridge", (accounts) => {
  let alice = accounts[0];
  let bob = accounts[1];
  let contract;
  let token;

  beforeEach(async () => {
    token = await TestToken.new();
    contract = await Bridge.new(token.address)
  });

  describe("#enter", () => {
    it("increases the users balance", async () => {
      mint(token, {
          [alice]: 2,
      }, accounts);

      await enter(contract, token, 2, alice);

      assert.equal(await contract.balanceOf(token.address, alice), 2);
    });
  });

  describe("#transfer", () => {
    it("decreases the sender's balance", async () => {
      mint(token, {
          [alice]: 5,
      }, accounts);

      await enter(contract, token, 5, alice);
      await contract.transfer(token.address, alice, bob, 2)

      assert.equal(await contract.balanceOf(token.address, alice), 3);
      assert.equal(await contract.balanceOf(token.address, bob), 2);
    });

    it("inreases the recipient's balance", async () => {
      mint(token, {
          [alice]: 5,
      }, accounts);

      await enter(contract, token, 5, alice);
      await contract.transfer(token.address, alice, bob, 2)

      assert.equal(await contract.balanceOf(token.address, bob), 2);
    });

    it("can only be called by the owner", async () => {
      mint(token, {
          [alice]: 5,
      }, accounts);

      await enter(contract, token, 5, alice);
      await assertFailure(assert, () =>
        contract.transfer(token.address, alice, bob, 2, {
          from: bob,
      }), vmError("revert"));
    });
  });

  describe("#exit", () => {
    it("decreases the user's balance", async () => {
      mint(token, {
          [alice]: 5,
      }, accounts);

      await enter(contract, token, 5, alice);
      await contract.exit(token.address, alice, 2);

      assert.equal(await contract.balanceOf(token.address, alice), 3);
      assert.equal(await token.balanceOf(alice), 2);
    });

    it("can only be called by the owner", async () => {
      mint(token, {
          [alice]: 5,
      }, accounts);

      await enter(contract, token, 5, alice);
      await assertFailure(assert, () =>
        contract.exit(token.address, alice, 2, {
          from: bob,
        }), vmError("revert"));
    });

  });
});
