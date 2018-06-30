pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Depositable.sol";
import "./Bridge.sol";
import "./utils/ECDSA.sol";

contract EllipitcoinStakingContract is Depositable, ECDSA {
  struct Transfer {
    uint amount;
    ERC20 token;
    address recipient;
    Signature signature;
  }

  struct Exit {
    uint amount;
    ERC20 token;
    Signature signature;
  }

  bytes32 public blockHash;
  Signature public lastSignature;
  Bridge public bridge;

  constructor(ERC20 _token, bytes32 randomSeed) Depositable(_token) public {
    lastSignature = Signature(0, randomSeed, randomSeed);
    bridge = new Bridge();
  }

  function submitBlock(
    bytes32 _blockHash,
    Transfer[] transfers,
    Exit[] exits,
    Signature signature
  ) public {
    require(msg.sender == winner());
    require(verifySignature(msg.sender, lastSignatureBytes(), "65", signature));
    processTransfers(transfers);
    processExits(exits);
    blockHash = _blockHash;
    lastSignature = signature;
  }

  function processTransfers(Transfer[] transfers) internal {
    for (uint i=0; i<transfers.length; i++) {
      Transfer memory transfer = transfers[i];

      bridge.transfer(
        transfer.token,
        ecrecover(
          signatureHash(transferToBytes(transfer), "96"),
          transfer.signature.v,
          transfer.signature.r,
          transfer.signature.s
        ),
        transfer.recipient,
        transfer.amount
      );
    }
  }

  function processExits(Exit[] exits) internal {
    for (uint i=0; i<exits.length; i++) {
      Exit memory exit = exits[i];

      bridge.exit(
        exit.token,
        ecrecover(
          signatureHash(exitToBytes(exit), "64"),
          exit.signature.v,
          exit.signature.r,
          exit.signature.s
        ),
        exit.amount
      );
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

  function transferToBytes(Transfer transfer) public pure returns (bytes) {
    return abi.encode(
      transfer.amount,
      transfer.token,
      transfer.recipient
    );
  }

  function exitToBytes(Exit exit) public pure returns (bytes) {
    return abi.encode(
      exit.amount,
      exit.token
    );
  }
}
