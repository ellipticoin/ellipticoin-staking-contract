const ERC20 = artifacts.require("zeppelin-solidity/contracts/token/ERC20/MintableToken.sol");
const _ = require("lodash");

const balanceOf = async (contract, address) =>
  await contract.balanceOf(address);

const bytesToHex = (bytes) => `0x${bytes.toString("hex")}`;

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
  return await Promise.all(_.map(balances, async (value, account) => {
    if(typeof account == "number") {
      return token.mint(accounts[account].address, value)
    } else {
      return token.mint(account, value)
    }
  }
  ));
}

const sign = (account, message, {privateKey}) => {
  return signatureToBytes(account.sign(bytesToHex(message), privateKey));
}

const signatureToBytes = ({signature}) =>
  new Buffer(signature.slice(2, -2), "hex");

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

module.exports = {
  balanceOf,
  bytesToHex,
  deposit,
  bytes64ToBytes32Array,
  mint,
  sign,
  signatureToBytes,
  callLastSignature,
  withdraw,
}
