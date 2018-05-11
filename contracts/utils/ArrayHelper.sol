pragma solidity ^0.4.23;

contract ArrayHelper {
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
