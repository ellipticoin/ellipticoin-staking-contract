const ERC20 = artifacts.require("zeppelin-solidity/contracts/token/ERC20/MintableToken.sol");
const _ = require("lodash");
const mint = async (token, balances, accounts) => {
  return await Promise.all(_.map(balances, async (value, account) =>
    token.mint(account, value)
  ));
}

const deposit = async (contract, from, amount) => {
  let token = ERC20.at(await contract.token.call());
  await token.approve(contract.address, amount, {
    from,
  });

  return await contract.deposit(amount, {
    from,
  });
}

const withdraw = async (contract, from, amount) =>
  await contract.withdraw(amount, {
    from,
  })

const balanceOf = async (contract, address) =>
  await contract.balanceOf(address);

module.exports = {
  mint,
  deposit,
  withdraw,
  balanceOf,
}
