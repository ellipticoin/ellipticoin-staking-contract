const ERC20 = artifacts.require("openzeppelin-solidity/contracts/token/ERC20/ERC20.sol");
const balanceOf = async (contract, token, address) =>
  await contract.balanceOf(token.address, address);

const enter = async (contract, token, amount, from) => {
  await token.approve(contract.address, amount, {
    from,
  });

  return await contract.enter(token.address, amount, {
    from,
  });
}

const transfer = async (contract, token, recipient, amount, from) =>
  await contract.transfer(token.address, recipient, amount, {
    from,
  })

const exit = async (contract, token, amount, from) =>
  await contract.exit(token.address, amount, {
    from,
  })

module.exports = {
  balanceOf,
  enter,
  exit,
  transfer,
}
