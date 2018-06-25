import 'babel-polyfill';
import Web3 from "web3";
import {
  deploy
} from "./utils";
import chai from "chai";
import chaiUseAsPromised from "chai-as-promised";
chai.use(chaiUseAsPromised);
const assert = chai.assert;

describe("Bridge", (accounts) => {
  let contract;
  let alice;
  let bob;
  let token;
  let web3;

  beforeEach(async () => {
    web3 = new Web3("http://localhost:8545");
    token = await deploy(web3, "test/TestToken.sol");
    contract = await deploy(web3, "Bridge.sol");
    [alice, bob] = await web3.eth.getAccounts();
  });

  describe("#enter", () => {
    it("increases the users balance", async () => {
      token.methods.mint(alice, 2).send({
        from: alice
      });

      await token.methods.approve(contract.options.address, 2).send({
        from: alice
      });
      await contract.methods.enter(token.options.address, 2).send({
        from: alice,
      });

      assert.equal(await contract.methods.balanceOf(token.options.address, alice).call(), 2);
    });
  });

  describe("#transfer", () => {
    it("decreases the sender's balance", async () => {
      await token.methods.mint(alice, 5).send();

      await token.methods.approve(contract.options.address, 5).send({
        from: alice
      });

      await contract.methods.enter(token.options.address, 5).send({
        from: alice,
      });

      await contract.methods.transfer(
        token.options.address,
        alice,
        bob,
        3
      ).send();

      assert.equal(await contract.methods.balanceOf(token.options.address, alice).call(), 2);
    });

    it("inreases the recipient's balance", async () => {
      await token.methods.mint(alice, 5).send();

      await token.methods.approve(contract.options.address, 5).send({
        from: alice
      });

      await contract.methods.enter(token.options.address, 5).send({
        from: alice,
      });

      await contract.methods.transfer(
        token.options.address,
        alice,
        bob,
        3
      ).send();

      assert.equal(await contract.methods.balanceOf(token.options.address, bob).call(), 3);
    });

    it("can only be called by the owner", async () => {
      await token.methods.mint(alice, 5).send();

      await token.methods.approve(contract.options.address, 3).send({
        from: alice
      });

      await contract.methods.enter(token.options.address, 3).send({
        from: alice,
      });

      await assert.isRejected(
        contract.methods.transfer(
          token.options.address,
          alice,
          bob,
          3
        ).send({
          from: bob,
        }),
        "revert",
      );
    });
  });

  describe("#exit", () => {
    it("decreases the user's balance in the bridge contract", async () => {
      await token.methods.mint(alice, 5).send();

      await token.methods.approve(contract.options.address, 5).send({
        from: alice
      });

      await contract.methods.enter(token.options.address, 5).send({
        from: alice,
      });

      await contract.methods.exit(token.options.address, alice, 3).send();
      assert.equal(await contract.methods.balanceOf(token.options.address, alice).call(), 2);
    });

    it("increase the user's token balance", async () => {
      await token.methods.mint(alice, 5).send();

      await token.methods.approve(contract.options.address, 5).send({
        from: alice
      });

      await contract.methods.enter(token.options.address, 5).send({
        from: alice,
      });

      await contract.methods.exit(token.options.address, alice, 3).send();

      assert.equal(await token.methods.balanceOf(alice).call(), 3);
    });

    it("can only be called by the owner", async () => {
      await token.methods.mint(alice, 5).send();

      await token.methods.approve(contract.options.address, 5).send({
        from: alice
      });

      await contract.methods.enter(token.options.address, 5).send({
        from: alice,
      });

      await assert.isRejected(
        contract.methods.exit(token.options.address, alice, 3).send({
          from: bob,
        }),
        "revert"
      );
    });
  });
});
