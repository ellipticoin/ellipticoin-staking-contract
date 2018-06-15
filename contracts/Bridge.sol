pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./utils/ArrayHelper.sol";

contract Bridge {
  mapping(address => mapping(address => uint)) public balances;

  function enter(ERC20 token, uint amount) public {
    require(token.balanceOf(msg.sender) >= amount);
    balances[token][msg.sender] += amount;
    token.transferFrom(msg.sender, this, amount);
  }

  function exit(ERC20 token, uint amount) public {
    require(balances[token][msg.sender] >= amount);
    balances[token][msg.sender] -= amount;
    token.approve(this, amount);
    token.transferFrom(this, msg.sender, amount);
  }

  function balanceOf(ERC20 token, address owner) public view returns (uint256) {
    return balances[token][owner];
  }
}
