var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var TestToken = artifacts.require("./utils/RSA.sol");
var RSA = artifacts.require("./utils/RSA.sol");
var RSAPublicModuliRegistry = artifacts.require("./RSAPublicModuliRegistry.sol");
var EllipticoinStakingContract = artifacts.require("./EllipticoinStakingContract.sol");

module.exports = async function(deployer) {
  deployer.deploy(SimpleStorage);
  await deployer.deploy(TestToken);
  let testToken = await TestToken.deployed();

  deployer.deploy(RSA);
  deployer.link(RSA, RSAPublicModuliRegistry);
  deployer.link(RSA, EllipticoinStakingContract);
  deployer.deploy(RSAPublicModuliRegistry);
  deployer.deploy(
    EllipticoinStakingContract,
    testToken.address,
    "0x" + Buffer(128).toString("hex")
  );
};
