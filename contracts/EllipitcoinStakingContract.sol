pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Depositable.sol";
import "./Bridge.sol";
import "./utils/ECDSA.sol";

contract EllipitcoinStakingContract is Depositable, ECDSA {
  enum TransactionType {
    Transfer,
    Exit
  }

  struct Transaction {
    TransactionType transactionType;
    uint amount;
    ERC20 token;
    address recipient;
    Signature signature;
  }

  bytes32 public blockHash;
  Signature public lastSignature;
  Bridge public bridge;

  constructor(ERC20 _token, bytes32 randomSeed) Depositable(_token) public {
    lastSignature = Signature(0, randomSeed, randomSeed);
    bridge = new Bridge();
  }

  function submitBlock(bytes32 _blockHash, Transaction[] transacations, Signature signature) public {
    require(msg.sender == winner());
    require(verifySignature(msg.sender, lastSignatureBytes(), "65", signature));
    processTransactions(transacations);
    blockHash = _blockHash;
    lastSignature = signature;
  }

  function processTransactions(Transaction[] transacations) public {
    for (uint i=0; i<transacations.length; i++) {
      Transaction memory transaction = transacations[i];

      if(transaction.transactionType == TransactionType.Transfer) {
        bridge.transfer(
          transaction.token,
          ecrecover(
            signatureHash(transactionToBytes(transaction), "128"),
            transaction.signature.v,
            transaction.signature.r,
            transaction.signature.s
          ),
          transaction.recipient,
          transaction.amount
        );
      } else if (transaction.transactionType == TransactionType.Exit) {
        bridge.exit(
          transaction.token,
          ecrecover(
            signatureHash(transactionToBytes(transaction), "128"),
            transaction.signature.v,
            transaction.signature.r,
            transaction.signature.s
          ),
          transaction.amount
        );
      }
    }
  }

  function winner() public view returns (address) {
    uint randomUint = lastSignature.v + (uint(lastSignature.r) + uint(lastSignature.s));
    uint winningValue = randomUint % totalStake();
    uint value = 0;
    uint i = 0;
    do {
      value += balanceOf(addresses[i]);
      i += 1;
    } while (value < winningValue);

    return addresses[i - 1];
  }

  function lastSignatureBytes() public view returns(bytes) {
    return signatureToBytes(lastSignature);
  }

  function signatureToBytes(Signature signature) internal pure returns (bytes){
    bytes memory byteArray;
    byteArray = new bytes(65);
    for(uint i=0; i < 32; i++){
      byteArray[i] = signature.r[i];
      byteArray[i+32] = signature.s[i];
    }
    byteArray[64] = byte(signature.v);
    return byteArray;
  }

  function transactionToBytes(Transaction transaction) public pure returns (bytes) {
    return abi.encode(
      transaction.transactionType,
      transaction.amount,
      transaction.token,
      transaction.recipient
    );
  }
}
