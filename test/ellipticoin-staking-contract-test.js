const _ = require("lodash");
const EllipitcoinStakingContract = artifacts.require("./EllipitcoinStakingContract.sol");
const TestToken = artifacts.require("./TestToken.sol");
const {
  balanceOf,
  encodeSignature,
  bytesToHex,
  deposit,
  mint,
  sign,
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
      encodeSignature(randomSeed)
  )
  });

  describe("#submitBlock", () => {
    it("sets `lastestBlockHash` to the `blockHash` that was submitted", async () => {
      const blockData = bytesToHex(new Buffer([]));
      const blockHash = web3.sha3(blockData);
      let lastSignature = await callLastSignature(contract);
      let signature = sign(web3, accounts[0], bytesToHex(lastSignature));
      await contract.submitBlock(blockHash, encodeSignature(signature));

      assert.equal(await contract.latestBlockHash.call(), blockHash);
      assert.deepEqual(await callLastSignature(contract), signature);
    })
  });
});
