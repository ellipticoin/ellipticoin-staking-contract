pragma solidity ^0.4.23;
// import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./TestToken.sol";

contract EllipitcoinStakingContract {
  TestToken public token; 
  address[] public addresses;
  mapping(address => uint) public balances;

  constructor(TestToken _token) public {
    token = _token;
  }

  function deposit(uint amount) public {
    require(token.balanceOf(msg.sender) >= amount);
    balances[msg.sender] += amount;
    addresses.push(msg.sender);
    token.transferFrom(msg.sender, this, amount);
  }

  function totalStake() public view returns (uint _totalStake){
    for(uint i = 0; i < addresses.length; i++) {
      _totalStake += balances[addresses[i]];
    }
  }
}
