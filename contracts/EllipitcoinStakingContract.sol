pragma solidity ^0.4.23;
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Depositable.sol";

contract EllipitcoinStakingContract is Depositable {
  constructor(ERC20 _token) Depositable(_token) public {}
}
