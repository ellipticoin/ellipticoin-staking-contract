import 'babel-polyfill';
import assert from 'assert';

import {
  deploy,
  web3,
} from "./utils";
import _ from "lodash";

describe("Depositable", (accounts) => {
  let contract;
  let alice;
  let bob;
  let token;

  beforeEach(async () => {
    let accounts;
    token = await deploy("test/TestToken.sol");
    contract = await deploy("Depositable.sol", token.options.address);
    [alice, bob] = await web3.eth.getAccounts();
  });

  describe("#deposit", () => {
    it("increases the user's balance", async () => {
      token.methods.mint(alice, 2).send({
        from: alice
      });

      await token.methods.approve(contract.options.address, 2).send({
        from: alice
      });
      await contract.methods.deposit(2).send({
        from: alice,
      });

      assert.equal(await contract.methods.balanceOf(alice).call(), 2);
    });
  });

  describe("#withdraw", () => {
    it("decreases the user's balance", async () => {
      token.methods.mint(alice, 5).send();

      await token.methods.approve(contract.options.address, 5).send({
        from: alice
      });
      await contract.methods.deposit(5).send({
        from: alice,
      });
      await contract.methods.withdraw(2).send({
        from: alice,
      });

      assert.equal(await contract.methods.balanceOf(alice).call(), 3);
      assert.equal(await token.methods.balanceOf(alice).call(), 2);
    });

    it("removes the user if their balance is 0", async () => {
      token.methods.mint(alice, 5).send();

      await token.methods.approve(contract.options.address, 5).send({
        from: alice
      });
      await contract.methods.deposit(5).send({
        from: alice,
      });
      await contract.methods.withdraw(5).send({
        from: alice,
      });

      assert.equal(await contract.methods.addressesLength().call(), 0);
    });
  });

  describe("#totalStake", () => {
    it("sums the deposits", async () => {
      token.methods.mint(alice, 3).send();

      token.methods.mint(bob, 2).send({
        from: alice
      });

      await token.methods.approve(contract.options.address, 3).send({
        from: alice
      });
      await contract.methods.deposit(3).send({
        from: alice,
      });
      await token.methods.approve(contract.options.address, 2).send({
        from: bob
      });
      await contract.methods.deposit(2).send({
        from: bob,
      });

      assert.equal(await contract.methods.totalStake().call(), 5);
    });
  });
});
