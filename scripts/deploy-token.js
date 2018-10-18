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
let tokenName = "[testnet] DAI Token";
let tokenSymbol = "DAI"
let tokenDecimals = 3;
let tokenSupply = 100 * (10 ** tokenDecimals);
const privateKey = new Buffer(process.env.PRIVATE_KEY, "hex");
let address = "0x" + util.privateToAddress(privateKey).toString("hex");

 async function run() {
  let [contract, bytecode] = await compile(web3, "utils/TestnetToken.sol");
  let {contractAddress} = await submitTransaction("0x" + contract.deploy({
      data: bytecode,
      arguments: [tokenName, tokenSymbol, tokenDecimals],
  }).encodeABI(), null, privateKey, web3);
  console.log(`Token Address: ${contractAddress}`)
  contract.options.address = contractAddress;
  let {transactionHash}  = await submitTransaction(contract.methods.mint(address, tokenSupply).encodeABI(), contractAddress, privateKey, web3);
  console.log(`Minted: ${tokenSupply/(10 ** tokenDecimals)} ${tokenSymbol}`);
  console.log(`Transaction Hash: ${transactionHash}`);
}
 run();
