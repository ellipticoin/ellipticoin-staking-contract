const _ = require("lodash");
const web3 = require("web3");
const EllipitcoinStakingContract = artifacts.require("./EllipitcoinStakingContract.sol");
const TestToken = artifacts.require("./TestToken.sol");
const {
  mint,
  deposit,
  balanceOf,
  withdraw,
} = require("./utils.js");

contract('EllipitcoinStakingContract', (accounts) => {
});
