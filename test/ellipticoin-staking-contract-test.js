/*
 * The winner of each staking round is determined by the value of the signature chain. This value is dependant on the private key of the transaction it's sent from. It isn't possible to send transacations from a specific private key
 * without [building the transaction yourself](https://ethereum.stackexchange.com/a/25852) so we need to test against a determisitic set of private keys by running ganache with the following arugments:
 *
 * 
 * `ganache-cli -m "medal junk auction menu dice pony version coyote grief dream dinosaur obscure"`
 */
import web3 from "./web3";
import Promise from "bluebird";
import _ from "lodash";
import chai from "chai";
import chaiUseAsPromised from "chai-as-promised";
chai.use(chaiUseAsPromised);
const assert = chai.assert;

const {
  abiEncode,
  bytes64ToBytes32Array,
  bytesToHex,
  callLastSignature,
  compile,
  defaultContractOptions,
  deploy,
  encodeSignature,
  expectThrow,
  hexToSignature,
  mint,
  setup,
  signatureToHex,
} = require("../src/utils.js");

const randomSeed = new Buffer(32);

describe("EllipticoinStakingContract", (accounts) => {
  let contract;
  let alice;
  let bob;
  let carol;
  let token;

  beforeEach(async () => {
    token = await deploy(web3, "test/TestToken.sol");
    contract = await deploy(
      web3,
      "EllipticoinStakingContract.sol",
      token.options.address,
      bytesToHex(randomSeed)
    );
    [alice, bob, carol] = await web3.eth.getAccounts();
  });

  describe("#submitBlock", () => {
    it("fails if the signature is incorrect", async () => {
      await setup(token, contract, {
          [alice]: 100,
      });

      let blockHash = web3.utils.sha3("0x00");
      let invalidSignature = bytesToHex(new Buffer(65));

      await assert.isRejected(
        contract.methods.submitBlock(
          blockHash,
          ...hexToSignature(invalidSignature)).call({
            from: bob,
          }),
        "revert",
      );
    });

    it("fails if the sender isn't the winner of this block", async () => {
      await setup(token, contract, {
          [alice]: 100,
          [bob]:   100,
          [carol]: 100,
      });

      let blockHash = web3.utils.sha3("0x00");
      let lastSignature = await contract.methods.lastSignature().call();
      //
      // The winner of the first block in our tests is
      // alice so signing with bob should fail
      let signature = await web3.eth.sign(signatureToHex(lastSignature), bob);

      await assert.isRejected(
        contract.methods.submitBlock(
          blockHash,
          ...hexToSignature(signature)).call({
            from: bob,
          }),
          "revert",
        );
    });

    it("sets `lastestBlockHash` to the `blockHash` that was submitted", async () => {
      await setup(token, contract, {
        [alice]: 1,
      });

      let blockHash = web3.utils.sha3("0x00");
      let winner = await contract.methods.winner().call();
      let lastSignature = await contract.methods.lastSignature().call();
      let signature = await web3.eth.sign(signatureToHex(lastSignature), winner);

      await contract.methods.submitBlock(
        blockHash,
        ...hexToSignature(signature)).send({
          from: winner,
        });

      assert.equal(await contract.methods.blockHash().call(), blockHash);
    });

    it("sets `lastSignature` to the `signature` that was submitted", async () => {
      await setup(token, contract, {
          [alice]: 1,
      });

      let blockHash = web3.utils.sha3("0x00");
      let winner = await contract.methods.winner().call();
      let lastSignature = await contract.methods.lastSignature().call();
      let signature = await web3.eth.sign(signatureToHex(lastSignature), winner);

      await contract.methods.submitBlock(
        blockHash,
        ...hexToSignature(signature)).send({
          from: winner,
        });

      let {v, r, s} = await contract.methods.lastSignature().call()

      assert.deepEqual(
        [parseInt(v), r, s],
        hexToSignature(signature)
      );
    });
  });

  describe("#winner", () => {
    it("returns a random winner each staking round", async () => {
      await setup(token, contract, {
          [alice]: 100,
          [bob]:   100,
          [carol]: 100,
      });


        let blockHash = web3.utils.sha3("0x00");
        let winners = await Promise.mapSeries(_.range(3), async () => {
          let winner = await contract.methods.winner().call();
          let lastSignature = await contract.methods.lastSignature().call();

          let signature = await web3.eth.sign(signatureToHex(lastSignature), winner);

          await contract.methods.submitBlock(
            blockHash,
            ...hexToSignature(signature)).send({
              from: winner,
            });

          return winner;
        });

        assert.deepEqual(winners, [alice, carol, bob]);
    });
  });
});
