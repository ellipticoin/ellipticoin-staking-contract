const ERC20 = artifacts.require("openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol");
const _ = require("lodash");
const BigNumber = require('bignumber.js');

const balanceOf = async (contract, address) =>
  await contract.balanceOf(address);

const bytesToHex = (bytes) => `0x${bytes.toString("hex")}`;
const hexTobytes = (hex) => new Buffer(hex, "hex");

const deposit = async (contract, from, amount) => {
  let token = ERC20.at(await contract.token.call());
  await token.approve(contract.address, amount, {
    from,
  });

  return await contract.deposit(amount, {
    from,
  });
}

const bytes64ToBytes32Array = (signature) => [
  bytesToHex(signature.slice(0, 32)),
  bytesToHex(signature.slice(32, 64)),
]


const mint = async (token, balances, accounts) => {
  return await Promise.all(_.map(balances, async (value, account) =>
    token.mint(account, value))
  );
}

const signatureToHex = (signature) => {
  return "0x" +
    signature[1].slice(2) +
    signature[2].slice(2) +
    signature[0].toString(16) + "0"
}

const signatureToVRS = (web3, signature) =>
  [
    web3.toBigNumber(parseInt(signature.slice(130), 16) + 27),
    `0x${signature.slice(2, 66)}`,
    `0x${signature.slice(66, 130)}`,
  ];

const callLastSignature = async (contract) =>
  Buffer.concat([
    Buffer((await contract.lastSignature.call(0)).slice(2), "hex"),
    Buffer((await contract.lastSignature.call(1)).slice(2), "hex"),
  ])


const withdraw = async (contract, from, amount) =>
  await contract.withdraw(amount, {
    from,
  })

module.exports = {
  balanceOf,
  bytesToHex,
  deposit,
  bytes64ToBytes32Array,
  mint,
  signatureToVRS,
  signatureToHex,
  callLastSignature,
  withdraw,
}
