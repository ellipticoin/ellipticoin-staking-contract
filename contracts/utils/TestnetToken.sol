pragma solidity ^0.4.21;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract TestnetToken is ERC20Detailed, ERC20Mintable {
  constructor(string name, string symbol, uint8 decimals)
  ERC20Detailed(name, symbol, decimals)
  public {}
   // Allow anyone to mint testnet tokens
  modifier hasMintPermission() {
    _;
  }
}
