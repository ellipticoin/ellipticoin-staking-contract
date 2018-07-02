/*
 * The winner of each staking round is determined by the value of the signature chain. This value is dependant on the private key of the transaction it's sent from. It isn't possible to send transacations from a specific private key
 * without [building the transaction yourself](https://ethereum.stackexchange.com/a/25852) so we need to test against a determisitic set of private keys by running ganache with the following arugments:
 *
 * 
 * `ganache-cli -m "medal junk auction menu dice pony version coyote grief dream dinosaur obscure"`
 */
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
  web3,
} = require("./utils.js");

const randomSeed = new Buffer(32);

describe("EllipitcoinStakingContract", (accounts) => {
  let contract;
  let alice;
  let bob;
  let carol;
  let token;

  beforeEach(async () => {
    token = await deploy("test/TestToken.sol");
    contract = await deploy(
      "EllipitcoinStakingContract.sol",
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
          [],
          [],
          hexToSignature(invalidSignature)).call({
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
          [],
          [],
          hexToSignature(signature)).call({
            from: bob,
          }),
          "revert",
        );
    });

    it("processes transfers", async () => {
      let [bridge, _bytecode] = await compile("Bridge.sol");
      bridge.options.address = await contract.methods.bridge().call();

      await setup(token, contract, {
        [alice]: 1,
      });
      await token.methods.mint(alice, 5).send();

      await token.methods.approve(bridge.options.address, 5).send({
        from: alice
      });

      await bridge.methods.enter(token.options.address, 5).send({
        from: alice,
      });

      let blockHash = web3.utils.sha3("0x00");
      let winner = await contract.methods.winner().call();
      let lastSignature = await contract.methods.lastSignature().call();
      let signature = await web3.eth.sign(signatureToHex(lastSignature), winner);
      let transfer = [
        3,
        token.options.address,
        bob,
        0,
      ]

      let transferSignature = await web3.eth.sign(abiEncode(transfer), alice);
      transfer.push(hexToSignature(transferSignature));

      await contract.methods.submitBlock(
        blockHash,
        [transfer],
        [],
        hexToSignature(signature)).send({
          from: winner,
        });


      assert.equal(await bridge.methods.balanceOf(token.options.address, alice).call(), 2);
      assert.equal(await bridge.methods.balanceOf(token.options.address, bob).call(), 3);
    });

    it("processes exits", async () => {
      let [bridge, _bytecode] = await compile("Bridge.sol");
      bridge.options.address = await contract.methods.bridge().call();

      await setup(token, contract, {
        [alice]: 1,
      });
      await token.methods.mint(alice, 5).send();

      await token.methods.approve(bridge.options.address, 5).send({
        from: alice
      });

      await bridge.methods.enter(token.options.address, 5).send({
        from: alice,
      });

      let blockHash = web3.utils.sha3("0x00");
      let winner = await contract.methods.winner().call();
      let lastSignature = await contract.methods.lastSignature().call();
      let signature = await web3.eth.sign(signatureToHex(lastSignature), winner);
      let exit = [
        3,
        token.options.address,
        0
      ]

      let exitSignature = await web3.eth.sign(abiEncode(exit), alice);
      exit.push(hexToSignature(exitSignature));

      await contract.methods.submitBlock(
        blockHash,
        [],
        [exit],
        hexToSignature(signature)).send({
          from: winner,
        });

      assert.equal(await bridge.methods.balanceOf(token.options.address, alice).call(), 2);
      assert.equal(await token.methods.balanceOf(alice).call(), 3);
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
        [],
        [],
        hexToSignature(signature)).send({
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
        [],
        [],
        hexToSignature(signature)).send({
          from: winner,
        });

      let {v, r, s} = await contract.methods.lastSignature().call()

      assert.deepEqual(
        [web3.utils.toBN(parseInt(v)), r, s],
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
            [],
            [],
            hexToSignature(signature)).send({
              from: winner,
            });

          return winner;
        });

        assert.deepEqual(winners, [alice, carol, bob]);
    });
  });
});
