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
const stakingContractAddress = "0x02343b1aC4e60d5b5e655fc249e45871544EA14f";
const stakingContractABIFilename = "dist/EllipitcoinStakingContract.abi";
const tokenContractAddress = "0xA1FB77a212419bfE1B58E906DC39993823b424EC";
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
    await submitTransaction(stakingContract.methods.deposit(amount).encodeABI(), stakingContractAddress, privateKey, web3);
    console.log(`Deposited ${amount / (10 **3)} tokens into ${address}`);
  });
}
 run();
