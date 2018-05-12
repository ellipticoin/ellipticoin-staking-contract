pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Depositable.sol";

contract EllipitcoinStakingContract is Depositable {
  bytes32 public latestBlockHash;
  bytes32[2] public lastSignature;

  constructor(ERC20 _token, bytes32[2] randomSeed) Depositable(_token) public {
    lastSignature = randomSeed;
  }

  function submitBlock(bytes32 blockHash, bytes32[2] signature) public {
    latestBlockHash = blockHash;
    lastSignature = signature;
  }
}
