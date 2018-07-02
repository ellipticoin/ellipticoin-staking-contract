pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./utils/ArrayHelper.sol";

contract Bridge is Ownable {
  mapping(address => mapping(address => uint)) public balances;
  mapping(address => uint) public nonces;

  function enter(ERC20 token, uint amount) public {
    require(token.balanceOf(msg.sender) >= amount);
    balances[token][msg.sender] += amount;
    token.transferFrom(msg.sender, this, amount);
  }

  function transfer(ERC20 token, address sender, address recipient, uint amount, uint nonce) public onlyOwner() {
    require(balances[token][sender] >= amount);
    require(nonces[sender] == nonce);
    nonces[sender] += 1;
    balances[token][sender] -= amount;
    balances[token][recipient] += amount;
  }

  function exit(ERC20 token, address recipient, uint amount, uint nonce) public onlyOwner() {
    require(balances[token][recipient] >= amount);
    require(nonces[recipient] == nonce);
    nonces[recipient] += 1;
    balances[token][recipient] -= amount;
    token.approve(this, amount);
    token.transferFrom(this, recipient, amount);
  }

  function balanceOf(ERC20 token, address owner) public view returns (uint256) {
    return balances[token][owner];
  }
}
