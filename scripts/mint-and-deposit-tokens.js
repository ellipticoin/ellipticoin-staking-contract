require("@babel/register");
require('dotenv').config();
const {
  compile,
  submitTransaction,
} = require("../src/utils");
const Web3 = require("web3");
const util = require("ethereumjs-util");
const Transaction = require('ethereumjs-tx');
const web3 = new Web3(process.env.WEB3_URL);
const fs = require("fs");
const privateKey = new Buffer(process.env.PRIVATE_KEY, "hex");
const blacksmithPrivateKeys = process.env.BLACKSMITH_PRIVATE_KEYS.split(",").map((key) => new Buffer(key, "hex"));
const stakingContractAddress = "0x5D00cDb13faB0D5802A82904e841D0E3eE2b6065";
const stakingContractABIFilename = "dist/EllipitcoinStakingContract.abi";
const tokenContractAddress = "0x573a5dDd00f0BcFb6Ee41138E8f67f97B707C9f5";
const tokenContractABIFilename = "dist/TestnetToken.abi";
const amount = 100 * (10 ** 3);


let address = "0x" + util.privateToAddress(privateKey).toString("hex");

async function run() {
  const stakingAbi = JSON.parse(fs.readFileSync(stakingContractABIFilename));
  const stakingContract = new web3.eth.Contract(stakingAbi, stakingContractAddress)
  const tokenAbi = JSON.parse(fs.readFileSync(tokenContractABIFilename));
  const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress)

  blacksmithPrivateKeys.forEach(async (privateKey) => {
    let address = "0x" + util.privateToAddress(privateKey).toString("hex");
    await submitTransaction(tokenContract.methods.mint(address, amount).encodeABI(), tokenContractAddress, privateKey, web3);
    await submitTransaction(tokenContract.methods.approve(stakingContractAddress, amount).encodeABI(), tokenContractAddress, privateKey, web3);
    await tokenContract.methods.allowance(address, stakingContractAddress).call();
    await stakingContract.methods.token().call();
    let result = await submitTransaction(stakingContract.methods.deposit(amount).encodeABI(), stakingContractAddress, privateKey, web3);
    console.log(`Deposited ${amount / (10 **3)} tokens into ${address}`);
  });
}
 run();
