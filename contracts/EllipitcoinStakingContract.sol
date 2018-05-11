pragma solidity ^0.4.23;
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract EllipitcoinStakingContract {
  ERC20 public token; 
  address[] public addresses;
  mapping(address => uint) public balances;

  constructor(ERC20 _token) public {
    token = _token;
  }

  function deposit(uint amount) public {
    require(token.balanceOf(msg.sender) >= amount);
    balances[msg.sender] += amount;
    addresses.push(msg.sender);
    token.transferFrom(msg.sender, this, amount);
  }

  function withdraw(uint amount) public {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;
    token.approve(this, amount);
    token.transferFrom(this, msg.sender, amount);
    if(balances[msg.sender] == 0) {
      addresses = removeValue(addresses, msg.sender);
    }
  }

  function balanceOf(address _owner) public view returns (uint256) {
    return balances[_owner];
  }

  function totalStake() public view returns (uint _totalStake){
    for(uint i = 0; i < addresses.length; i++) {
      _totalStake += balances[addresses[i]];
    }
  }

  function addressesLength() public view returns (uint){
    return addresses.length;
  }
  function removeValue(address[] array, address value) pure internal returns(address[]) {
    return removeAtIndex(array, indexOf(array, value));
  }


  function indexOf(address[] array, address value) pure internal returns(uint) {
    for(uint i = 0; i < array.length; i++){
      if(value == array[i]) return i;
    }
  }

  function removeAtIndex(address[] array, uint index) pure internal returns(address[] value) {
    if (index >= array.length) return;

    address[] memory arrayNew = new address[](array.length-1);
    for (uint i = 0; i<arrayNew.length; i++){
      if(i != index && i<index){
        arrayNew[i] = array[i];
      } else {
        arrayNew[i] = array[i+1];
      }
    }
    delete array;
    return arrayNew;
  }
}
