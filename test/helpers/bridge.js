const ERC20 = artifacts.require("openzeppelin-solidity/contracts/token/ERC20/ERC20.sol");

const enter = async (contract, token, amount, from) => {
  await token.approve(contract.address, amount, {
    from,
  });

  return await contract.enter(token.address, amount, {
    from,
  });
}

module.exports = {
  enter,
}
