import 'babel-polyfill';
import Web3 from 'web3';
import assert from 'assert';

import {
  deploy
} from "./utils";
import _ from "lodash";

describe("Depositable", (accounts) => {
  let contract;
  let alice;
  let bob;
  let token;
  let web3;

  beforeEach(async () => {
    let accounts;
    web3 = new Web3("http://localhost:8545");
    token = await deploy(web3, "test/TestToken.sol");
    contract = await deploy(web3, "Depositable.sol", token.options.address);
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
