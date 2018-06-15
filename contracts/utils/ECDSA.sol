pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

contract ECDSA {
  struct Signature {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  function verifySignature(address _address, bytes _bytes, Signature signature) pure returns(bool) {
    return ecrecover(
      signatureHash(_bytes),
      signature.v,
      signature.r,
      signature.s
    ) == _address;
  }

  function verifyVRS(address _address, bytes _bytes, uint8 v, bytes32 r, bytes32 s) public pure returns (bool) {
    Signature memory signature = Signature(v,r,s); 
    return verifySignature(
      _address,
      _bytes,
      signature
    );
  }

  function signatureHash(bytes _bytes) pure returns (bytes32) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n65";
    return keccak256(prefix, _bytes);
  }

  function recoverAddress(bytes _bytes, uint8 v, bytes32 r, bytes32 s) pure returns(address) {
    return ecrecover(
      signatureHash(_bytes),
      v,
      r,
      s
    );
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
