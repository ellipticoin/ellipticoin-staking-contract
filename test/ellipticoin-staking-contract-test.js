const _ = require("lodash");
const web3one = new (require("web3"))(web3.currentProvider);
const Web3EthAccounts = require('web3-eth-accounts');

const EllipitcoinStakingContract = artifacts.require("./EllipitcoinStakingContract.sol");
const TestToken = artifacts.require("./TestToken.sol");
const privateKeys = [
  "0x8b984e11a6c2f99c7232b02dcb93b0ad8ba3e557339b72a5f64dff80a7307f59",
]

const dummyBlockData = [
  "0x00",
  "0x01",
  "0x02",
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

contract("EllipitcoinStakingContract", (_accounts) => {
  let contract;
  let token;
  let accounts;
  let account;

  before(async () => {
    account = new Web3EthAccounts(web3);
    accounts = privateKeys.map((privateKey) =>
      account.privateKeyToAccount(privateKey)
    );
  });

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
      let signature = sign(account, lastSignature, accounts[0]);
      await contract.submitBlock(dummyBlockHashes[0], bytes64ToBytes32Array(signature));

      assert.equal(await contract.latestBlockHash.call(), dummyBlockHashes[0]);
    });

    it("sets `lastSignature` to the `signature` that was submitted", async () => {
      let lastSignature = await callLastSignature(contract);
      let signature = sign(account, lastSignature, accounts[0]);
      await contract.submitBlock(dummyBlockHashes[0], bytes64ToBytes32Array(signature));

      assert.deepEqual(await callLastSignature(contract), signature);
    });
  });
});
