/*
 * The winner of each staking round is determined by the value of the signature chain. This value is dependant on the private key of the transaction it's sent from. It isn't possible to send transacations from a specific private key
 * without [building the transaction yourself](https://ethereum.stackexchange.com/a/25852) so we need to test against a determisitic set of private keys by running ganache with the following arugments:
 *
 * 
 * `ganache-cli -m "medal junk auction menu dice pony version coyote grief dream dinosaur obscure"`
 */
const chai = require('chai')
  .use(require('chai-as-promised'))
var assert = chai.assert;

const Promise = require("bluebird");
const _ = require("lodash");
const EllipitcoinStakingContract = artifacts.require("./EllipitcoinStakingContract.sol");
const TestToken = artifacts.require("./TestToken.sol");
const ethers = require('ethers');

const dummyBlockData = [
  "0x00",
];

const dummyBlockHashes = dummyBlockData.map(web3.sha3);

const {
  bytes64ToBytes32Array,
  encodeSignature,
  bytesToHex,
  mint,
  signatureToVRS,
  signatureToHex,
  callLastSignature,
  expectThrow,
} = require("./utils.js");

const {
  deposit,
  balanceOf,
  withdraw,
} = require("./helpers/depositable.js");

const randomSeed = new Buffer(32);

contract("EllipitcoinStakingContract", (accounts) => {
  let contract;
  let token;

  beforeEach(async () => {
    token = await TestToken.new();
    web3Contract = await EllipitcoinStakingContract.new(
      token.address,
      bytesToHex(randomSeed)
    );
    var provider = new ethers.providers.Web3Provider(web3.currentProvider)

    contract = new ethers.Contract(
      web3Contract.address,
      web3Contract.abi,
      provider,
    );
  });

  describe("#submitBlock", () => {
    it("fails if the signature is incorrect", async () => {
      await mint(token, {
          [accounts[0]]: 100,
      }, accounts);
      await deposit(contract, accounts[0], 100);

      let invalidSignature = bytesToHex(new Buffer(65));

      await assert.isRejected(
        contract.submitBlock.call(
          dummyBlockHashes[0],
          ...signatureToVRS(web3, invalidSignature), {
            from: accounts[0],
          }),
          "revert",
        );
    });

    it("fails if the sender isn't the winner of this block", async () => {
      await mint(token, {
          [accounts[0]]: 100,
          [accounts[1]]: 100,
          [accounts[2]]: 100,
      }, accounts);
      await deposit(contract, accounts[0], 100);
      await deposit(contract, accounts[1], 100);
      await deposit(contract, accounts[2], 100);
      let lastSignature = await contract.lastSignature();
      let signature = web3.eth.sign(accounts[0], signatureToHex(lastSignature));

      // The winner of the first block in our tests is
      // accounts[0] so signing with accounts[1] should fail
      await assert.isRejected(
        contract.submitBlock.call(
          dummyBlockHashes[0],
          ...signatureToVRS(web3, signature), {
            from: accounts[1],
          }),
          "revert",
        );
    });

    it.only("sets `lastestBlockHash` to the `blockHash` that was submitted", async () => {
      await mint(token, {
          [accounts[0]]: 1,
      });
      await deposit(contract, accounts[0], 1);

      let winner = await contract.winner();
      let lastSignature = await contract.lastSignature();
      let signature = web3.eth.sign(winner, signatureToHex(lastSignature));

      await contract.submitBlock(
        dummyBlockHashes[0],
        ...signatureToVRS(web3, signature), {
          from: winner,
        });

      assert.equal(await contract.blockHash.call(), dummyBlockHashes[0]);
    });

    it("sets `lastSignature` to the `signature` that was submitted", async () => {
      await mint(token, {
          [accounts[0]]: 1,
      });
      await deposit(contract, accounts[0], 1);

      let winner = await contract.winner();
      let lastSignature = await contract.lastSignature();
      let signature = web3.eth.sign(winner, signatureToHex(lastSignature));

      await contract.submitBlock(
        dummyBlockHashes[0],
        ...signatureToVRS(web3, signature), {
          from: winner,
        }
      );

      assert.deepEqual(
        await contract.lastSignature(),
        signatureToVRS(web3, signature),
      );
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
        let lastSignature = await contract.lastSignature();

        let signature = web3.eth.sign(winner, signatureToHex(lastSignature));

        await contract.submitBlock(
          dummyBlockHashes[0],
          ...signatureToVRS(web3, signature), {
            from: winner,
        });

        return winner;
      });

      assert.deepEqual(winners, [accounts[0], accounts[2], accounts[1]]);
    });
  });
});
