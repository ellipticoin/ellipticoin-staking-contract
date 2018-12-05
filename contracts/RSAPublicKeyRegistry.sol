pragma solidity ^0.4.23;

contract RSAPublicKeyRegistry {
  mapping(address => bytes) public rsaPublicKeys;

  function setRSAPublicKey(bytes rsaPublicKey) public {
    rsaPublicKeys[msg.sender] = rsaPublicKey;
  }

  function getRSAPublicKey(address _address) public view returns (bytes) {
    return rsaPublicKeys[_address];
  }
}
