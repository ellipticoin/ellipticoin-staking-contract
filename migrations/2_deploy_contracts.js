var EllipitcoinStakingContract = artifacts.require("./EllipitcoinStakingContract.sol");
var TestToken = artifacts.require("./TestToken.sol");

module.exports = async (deployer) => {
  await deployer.deploy(TestToken);
  testToken = await TestToken.deployed();

  return Promise.all([
    deployer.deploy(
      EllipitcoinStakingContract,
      testToken.contract.address,
      `0x${new Buffer(32).toString("hex")}`
    ),
  ]);
};
