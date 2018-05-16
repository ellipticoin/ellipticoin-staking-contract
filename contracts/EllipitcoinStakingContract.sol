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

  function winner() public view returns (address) {
    uint randomUint = (uint(lastSignature[0]) + uint(lastSignature[1]));
    uint winningValue = randomUint % totalStake();
    uint value = 0;
    uint i = 0;
    do {
      value += balanceOf(addresses[i]);
      i += 1;
    } while (value < winningValue);

    return addresses[i - 1];
  }
}
