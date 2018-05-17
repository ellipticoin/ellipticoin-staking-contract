pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

contract ECDSA {
  struct Signature {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  function signatureToBytes(Signature signature) pure returns (bytes){
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
