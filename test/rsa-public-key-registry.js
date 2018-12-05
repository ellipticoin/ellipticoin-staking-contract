import { generatePrivateKey } from 'ursa';
import web3 from "./web3";
import 'babel-polyfill';
import assert from 'assert';

import {
  deploy,
  bytesToHex,
} from "../src/utils";
import _ from "lodash";

describe("RSAPublicKeyRegistry", (accounts) => {
  let contract;
  let alice;
  let bob;
  let token;

  beforeEach(async () => {
    let accounts;
    token = await deploy(web3, "test/TestToken.sol");
    contract = await deploy(web3, "RSAPublicKeyRegistry.sol", token.options.address);
    [alice, bob] = await web3.eth.getAccounts();
  });

  describe("#setRSAPublicKey", () => {
    it("sets the user's RSA public key", async () => {
      let privateKey = generatePrivateKey(1024);
      let publicKey = privateKey.toPublicPem();

      contract.methods.setRSAPublicKey(publicKey).send({
        from: alice
      });

      assert.equal(await contract.methods.getRSAPublicKey(alice).call(), bytesToHex(publicKey));
    });
  });
});
