/*
 * The winner of each staking round is determined by the value of the signature chain. This value is dependant on the private key of the transaction it's sent from. It isn't possible to send transacations from a specific private key
 * without [building the transaction yourself](https://ethereum.stackexchange.com/a/25852) so we need to test against a determisitic set of private keys by running ganache with the following arugments:
 *
 * 
 * `ganache-cli -m "shed purchase execute winner frog clog cotton vehicle globe glory soon aunt"`
 */

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
    it("sets `lastestBlockHash` to the `blockHash` that was submitted", async () => {
      let lastSignature = await callLastSignature(contract);
      let signature = sign(web3, accounts[0], lastSignature);
      await contract.submitBlock(dummyBlockHashes[0], bytes64ToBytes32Array(signature));

      assert.equal(await contract.latestBlockHash.call(), dummyBlockHashes[0]);
    });

    it("sets `lastSignature` to the `signature` that was submitted", async () => {
      let lastSignature = await callLastSignature(contract);
      let signature = sign(web3, accounts[0], lastSignature);
      await contract.submitBlock(dummyBlockHashes[0], bytes64ToBytes32Array(signature));

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
        let lastSignature = await callLastSignature(contract);
        let signature = sign(web3, accounts[0], lastSignature);
        await contract.submitBlock(dummyBlockHashes[0], bytes64ToBytes32Array(signature));

        return await contract.winner();
      });

      assert.deepEqual(winners, [accounts[1], accounts[2], accounts[0]]);
    });
  });
});
