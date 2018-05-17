pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Depositable.sol";
import "./utils/ECDSA.sol";

contract EllipitcoinStakingContract is Depositable, ECDSA {
  bytes32 public blockHash;
  Signature public lastSignature;

  constructor(ERC20 _token, bytes32 randomSeed) Depositable(_token) public {
    lastSignature = Signature(0, randomSeed, randomSeed);
  }

  function echoSignature(uint8 v, bytes32 r, bytes32 s) public returns (bytes){
    lastSignature = Signature(v,r,s);
    return signatureToBytes(lastSignature);
  }

  function submitBlock(bytes32 _blockHash, uint8 v, bytes32 r, bytes32 s) public {
    require(msg.sender == winner());
    blockHash = _blockHash;
    lastSignature = Signature(v,r,s);
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
}
