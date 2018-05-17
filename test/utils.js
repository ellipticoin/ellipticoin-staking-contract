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

const sign = (web3, address, message) => {
  // console.log(message)
  // console.log(web3.eth.sign(address, bytesToHex(message)));
  return web3.eth.sign(address, message);
}

const signatureToHex = (signature) => {
  // console.log(signature);
  return "0x" +
    signature[1].slice(2) +
    signature[2].slice(2) +
    signature[0].toString(16) + "0"
}

const signatureToVRS = (web3, signature) =>
  [
    web3.toBigNumber(parseInt(signature.slice(130), 16)),
    `0x${signature.slice(2, 66)}`,
    `0x${signature.slice(66, 130)}`,
  ]


const callLastSignature = async (contract) => {
  return Buffer.concat([
    Buffer((await contract.lastSignature.call(0)).slice(2), "hex"),
    Buffer((await contract.lastSignature.call(1)).slice(2), "hex"),
  ]);
}

const withdraw = async (contract, from, amount) =>
  await contract.withdraw(amount, {
    from,
  })

// https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/test/helpers/expectThrow.js
const expectThrow = async (promise) => {
  try {
    await promise;
  } catch (error) {
    // TODO: Check jump destination to destinguish between a throw
    //       and an actual invalid jump.
    const invalidOpcode = error.message.search('invalid opcode') >= 0;
    // TODO: When we contract A calls contract B, and B throws, instead
    //       of an 'invalid jump', we get an 'out of gas' error. How do
    //       we distinguish this from an actual out of gas event? (The
    //       ganache log actually show an 'invalid jump' event.)
    const outOfGas = error.message.search('out of gas') >= 0;
    const revert = error.message.search('revert') >= 0;
    assert(
      invalidOpcode || outOfGas || revert,
      'Expected throw, got \'' + error + '\' instead',
    );
    return;
  }
  assert.fail('Expected throw not received');
};

module.exports = {
  balanceOf,
  bytesToHex,
  deposit,
  bytes64ToBytes32Array,
  mint,
  sign,
  signatureToVRS,
  signatureToHex,
  callLastSignature,
  expectThrow,
  withdraw,
}
