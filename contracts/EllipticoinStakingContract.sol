pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Depositable.sol";
import "./utils/ECDSA.sol";

contract EllipticoinStakingContract is Depositable, ECDSA {
  bytes32 public blockHash;
  Signature public lastSignature;

  constructor(ERC20 _token, bytes32 randomSeed) Depositable(_token) public {
    lastSignature = Signature(0, randomSeed, randomSeed);
  }

  function submitBlock(
    bytes32 _blockHash,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public {
    Signature memory signature = Signature(v, r, s);
    require(msg.sender == winner());
    require(verifySignature(msg.sender, lastSignatureBytes(), "65", signature));
    blockHash = _blockHash;
    lastSignature = signature;
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
}
