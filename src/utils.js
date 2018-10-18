import path from "path";
import fs from "fs";
import solc from "solc";
import _ from "lodash";
import BigNumber from "bignumber.js";
import Transaction from "ethereumjs-tx";
import util from "ethereumjs-util";

export const bytesToHex = (bytes) => `0x${bytes.toString("hex")}`;
export const hexTobytes = (hex) => new Buffer(hex, "hex");

export const defaultContractOptions = {
  gasPrice: 100000000000,
  gasLimit: 4712388,
}

export function abiEncode(web3, parameters) {
  let parametersWithType = _.reduce(parameters, (result, value) => {
      let type;

      if(Number.isInteger(value)) {
        type = "uint256";
      } else {
        type = "address";
      }
      result[0].push(type);
      result[1].push(value.toString());

      return result;
    },
    [[],[]]);

  return web3.eth.abi.encodeParameters(...parametersWithType);
}

export async function deploy(web3, fileName, ...args) {
    let [contract, bytecode] = await compile(web3, fileName, args)
    args = args || [];
    let deployed  = await contract.deploy({
        data: bytecode,
        arguments: args,
    }).send();

    return deployed;
}

export async function compile(web3, fileName, ...args) {
    let baseName = path.basename(fileName);
    let contractName = path.basename(fileName, ".sol");
    let contractsDir = path.resolve(__dirname, "..", "contracts");
    let content = fs.readFileSync(`/${contractsDir}/${fileName}`).toString();
    let sources = {
      [baseName]: content
    };

    const output = solc.compile({sources}, 1, (dependencyPath) => {
      let contractsPath  = path.resolve(process.cwd(), "contracts", dependencyPath)
      let npmPath  = path.resolve(process.cwd(), "node_modules", dependencyPath)
      if(fs.existsSync(contractsPath)) {
        return { contents: fs.readFileSync(contractsPath).toString() }
      } else if(fs.existsSync(npmPath)) {
        return { contents: fs.readFileSync(npmPath).toString() }
      } else {
        throw `${npmPath} not found in search path`;
      }
    });

    if(output.errors) {
      output.errors.forEach((message) => console.log(message));
    };

    let bytecode = output.contracts[`${baseName}:${contractName}`].bytecode
    let abi = JSON.parse(output.contracts[`${baseName}:${contractName}`].interface);
    let accounts = await web3.eth.getAccounts();

    return [await (new web3.eth.Contract(abi, {
      ...defaultContractOptions,
      from: accounts[0],
    })), bytecode];
}

export function bytes64ToBytes32Array(signature) {
  return [
    bytesToHex(signature.slice(0, 32)),
    bytesToHex(signature.slice(32, 64)),
  ];
}

export function vmError(message) {
  return `VM Exception while processing transaction: ${message}`;
}

export async function assertFailure(assert, f, message) {
  try {
    await f();
  } catch (e) {
    return assert.equal(e.message, message);
  }
  assert.fail(null, null, `"${message}" never thrown`);
}

export async function mint(token, balances, accounts) {
  return await Promise.all(_.map(balances, async (value, account) =>
    token.mint(account, value))
  );
};

export function signatureToHex(signature) {
  return "0x" +
    signature[1].slice(2) +
    signature[2].slice(2) +
    _.padEnd(parseInt(signature[0]).toString(16), 2, "0");
}

export function hexToSignature(signature) {
  return [
    parseInt(signature.slice(130), 16) + 27,
    `0x${signature.slice(2, 66)}`,
    `0x${signature.slice(66, 130)}`,
  ];
}

export async function callLastSignature(contract) {
  return Buffer.concat([
    Buffer((await contract.lastSignature.call(0)).slice(2), "hex"),
    Buffer((await contract.lastSignature.call(1)).slice(2), "hex"),
  ]);
}

export async function setup(token, contract, accounts) {
  await Promise.all(_.map(accounts, async(value, from) => {
      token.methods.mint(from, value).send();
      await token.methods.approve(contract.options.address, value).send({
        from
      });
      return await contract.methods.deposit(value).send({from});
  }))
}

export async function submitTransaction(data, to = null, privateKey, web3) {
  let address = "0x" + util.privateToAddress(privateKey).toString("hex");
  let nonce = web3.utils.toHex(await web3.eth.getTransactionCount(address));
  let tx;
  if (to) {
    tx = new Transaction({
      to,
      nonce,
      gasPrice: web3.utils.toHex(defaultContractOptions.gasPrice),
      gasLimit: web3.utils.toHex(defaultContractOptions.gasLimit),
      data,
    });
  } else {
    tx = new Transaction({
      nonce,
      gasPrice: web3.utils.toHex(defaultContractOptions.gasPrice),
      gasLimit: web3.utils.toHex(defaultContractOptions.gasLimit),
      data,
    });
  }
   tx.sign(privateKey);
   var serializedTx = tx.serialize();
   return await web3.eth
    .sendSignedTransaction("0x" + serializedTx.toString("hex"));
}
