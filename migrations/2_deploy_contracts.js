var EllipitcoinStakingContract = artifacts.require("./EllipitcoinStakingContract.sol");
var TestToken = artifacts.require("./TestToken.sol");

module.exports = (deployer) => {
  return Promise.all([
    deployer.deploy(TestToken),
  ]);
};
