const Web3 = require("web3");
const web3 = new Web3();
require('dotenv').config();
const _ = require("lodash");
const WalletProvider = require("truffle-wallet-provider");
const Wallet = require('ethereumjs-wallet');

// Read the `MAINNET_PRIVATE_KEY` and convert it to a node Buffer
var mainNetPrivateKey = new Buffer(process.env["MAINNET_PRIVATE_KEY"], "hex")
// Create a new wallet from our private key
var mainNetWallet = Wallet.fromPrivateKey(mainNetPrivateKey);
// Connect our wallet to the public infura node
var mainNetProvider = new WalletProvider(mainNetWallet, "https://mainnet.infura.io/");

var rinkebyPrivateKey = new Buffer(process.env["RINKEBY_PRIVATE_KEY"], "hex")
var rinkebyWallet = Wallet.fromPrivateKey(rinkebyPrivateKey);
var rinkebyProvider = new WalletProvider(rinkebyWallet, "https://rinkeby.infura.io/");

var kovanPrivateKey = new Buffer(process.env["KOVAN_PRIVATE_KEY"], "hex")
var kovanWallet = Wallet.fromPrivateKey(kovanPrivateKey);
var kovanProvider = new WalletProvider(kovanWallet, "https://kovan.infura.io/");

var sokolPrivateKey = new Buffer(process.env["SOKOL_PRIVATE_KEY"], "hex")
var sokolWallet = Wallet.fromPrivateKey(sokolPrivateKey);
var sokolProvider = new WalletProvider(sokolWallet, "https://sokol.poa.network/");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    sokol: {
      host: "localhost",
      provider: sokolProvider,
      gas: 4600000,
      gasPrice: web3.toWei("20", "gwei"),
      network_id: "77",
    },
    rinkeby: {
      host: "localhost",
      provider: kovanProvider,
      gas: 4600000,
      gasPrice: web3.toWei("20", "gwei"),
      network_id: "4",
    },
    kovan: {
      host: "localhost",
      provider: kovanProvider,
      // You can get the current gasLimit by running
      // truffle deploy --network kovan
      // truffle(kovan)> web3.eth.getBlock("pending", (error, result) => console.log(result.gasLimit))
      gas: 4600000,
      // You can get the average gas price at
      // https://ethgasstation.info/
      gasPrice: web3.toWei("20", "gwei"),
      network_id: "3",
    },
    mainnet: {
      host: "localhost",
      provider: mainNetProvider,
      gas: 4600000,
      gasPrice: web3.toWei("10", "gwei"),
      network_id: "1"
    }
  }
};
