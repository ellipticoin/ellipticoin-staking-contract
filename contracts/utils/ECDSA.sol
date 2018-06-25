pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

contract ECDSA {
  struct Signature {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  function verifySignature(address _address, bytes _bytes, Signature signature) internal pure returns(bool) {
    return ecrecover(
      signatureHash(_bytes),
      signature.v,
      signature.r,
      signature.s
    ) == _address;
  }

  function signatureHash(bytes _bytes) internal pure returns (bytes32) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n65";
    return keccak256(abi.encodePacked(prefix, _bytes));
  }
}
