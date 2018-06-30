import Web3 from "web3";
import path from "path";
import fs from "fs";
import solc from "solc";
import _ from "lodash";
import BigNumber from "bignumber.js";

export const bytesToHex = (bytes) => `0x${bytes.toString("hex")}`;
export const hexTobytes = (hex) => new Buffer(hex, "hex");
export const web3 = new Web3("http://localhost:8545");

export const defaultContractOptions = {
  gasPrice: 100000000000,
  gas: 4712388,
}

export async function deploy(fileName, ...args) {
    let [contract, bytecode] = await compile(fileName, args)

    return await contract.deploy({
        data: bytecode,
        arguments: args,
    }).send();
}

export async function compile(fileName, ...args) {
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
    let {abi} = JSON.parse(output.contracts[`${baseName}:${contractName}`].metadata).output;
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
    web3.utils.toBN(parseInt(signature.slice(130), 16) + 27),
    `0x${signature.slice(2, 66)}`,
    `0x${signature.slice(66, 130)}`,
  ];
}

export function transactionToHex(transaction) {
  return "0x" +
    transaction[0].toString(16).toLowerCase().padStart(64, "0") +
    transaction[1].toString(16).toLowerCase().padStart(64, "0") +
    transaction[2].slice(2).toLowerCase().padStart(64, "0") +
    transaction[3].slice(2).toLowerCase().padStart(64, "0")

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
