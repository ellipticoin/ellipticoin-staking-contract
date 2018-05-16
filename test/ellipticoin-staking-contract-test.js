/*
 * The winner of each staking round is determined by the value of the signature chain. This value is dependant on the private key of the transaction it's sent from. It isn't possible to send transacations from a specific private key
 * without [building the transaction yourself](https://ethereum.stackexchange.com/a/25852) so we need to test against a determisitic set of private keys by running ganache with the following arugments:
 *
 * 
 * `ganache-cli -m "scatter dilemma proud orphan riot crucial truth theory place coast attend rotate"`
 */
const chai = require('chai')
  .use(require('chai-as-promised'))
var assert = chai.assert;

const Promise = require("bluebird");
const _ = require("lodash");
const EllipitcoinStakingContract = artifacts.require("./EllipitcoinStakingContract.sol");
const TestToken = artifacts.require("./TestToken.sol");

const dummyBlockData = [
  "0x00",
];

const dummyBlockHashes = dummyBlockData.map(web3.sha3);

const {
  balanceOf,
  bytes64ToBytes32Array,
  encodeSignature,
  bytesToHex,
  deposit,
  mint,
  sign,
  signatureToBytes,
  callLastSignature,
  withdraw,
  expectThrow,
} = require("./utils.js");
const randomSeed = new Buffer(64);

contract("EllipitcoinStakingContract", (accounts) => {
  let contract;
  let token;

  beforeEach(async () => {
    token = await TestToken.new();
    contract = await EllipitcoinStakingContract.new(
      token.address,
      bytes64ToBytes32Array(randomSeed)
    )
  });

  describe("#submitBlock", () => {
    it("fails if the sender isn't the winner of this block", async () => {
      await mint(token, {
          [accounts[0]]: 100,
          [accounts[1]]: 100,
          [accounts[2]]: 100,
      }, accounts);
      await deposit(contract, accounts[0], 100);
      await deposit(contract, accounts[1], 100);
      await deposit(contract, accounts[2], 100);

      let lastSignature = await callLastSignature(contract);
      let signature = sign(web3, accounts[0], lastSignature);

      // Note: the winner of the first block in our tests is
      // accounts[0] so signing with accounts[1] should fail
      await assert.isRejected(
        contract.submitBlock.call(
          dummyBlockHashes[0],
          bytes64ToBytes32Array(signature), {
              from: accounts[1]
          }),
          "revert",
        );
    });

    it("sets `lastestBlockHash` to the `blockHash` that was submitted", async () => {
      await mint(token, {
          [accounts[0]]: 1,
      });
      await deposit(contract, accounts[0], 1);

      let winner = await contract.winner();
      let lastSignature = await callLastSignature(contract);
      let signature = sign(web3, winner, lastSignature);
      await contract.submitBlock(
        dummyBlockHashes[0],
        bytes64ToBytes32Array(signature), {
          from: winner,
        });

      assert.equal(await contract.latestBlockHash.call(), dummyBlockHashes[0]);
    });

    it("sets `lastSignature` to the `signature` that was submitted", async () => {
      await mint(token, {
          [accounts[0]]: 1,
      });
      await deposit(contract, accounts[0], 1);

      let winner = await contract.winner();
      let lastSignature = await callLastSignature(contract);
      let signature = sign(web3, winner, lastSignature);
      await contract.submitBlock(
        dummyBlockHashes[0],
        bytes64ToBytes32Array(signature), {
          from: winner,
        }
      );

      assert.deepEqual(await callLastSignature(contract), signature);
    });
  });

  describe("#winner", () => {
    it("returns a random winner each staking round", async () => {
      mint(token, {
          [accounts[0]]: 100,
          [accounts[1]]: 100,
          [accounts[2]]: 100,
      }, accounts);

      await deposit(contract, accounts[0], 100);
      await deposit(contract, accounts[1], 100);
      await deposit(contract, accounts[2], 100);

      let winners = await Promise.mapSeries(_.range(3), async () => {
        let winner = await contract.winner();
        let lastSignature = await callLastSignature(contract);
        let signature = sign(web3, winner, lastSignature);
        await contract.submitBlock(
          dummyBlockHashes[0],
          bytes64ToBytes32Array(signature), {
            from: winner,
        });

        return winner;
      });

      assert.deepEqual(winners, [accounts[0], accounts[2], accounts[1]]);
    });
  });
});
