const ERC20 = artifacts.require("openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol");
const balanceOf = async (contract, address) =>
  await contract.balanceOf(address);

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

module.exports = {
  deposit,
  withdraw,
  balanceOf,
}
