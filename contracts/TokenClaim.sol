// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20Token {
    function balanceOf(address account) external view returns (uint256);

    function mint(address _to, uint256 _amount) external;
}

contract TokenClaim is Ownable {
    IERC20Token private immutable _tokenInstance;
    bool private _islIve;
    uint256 private _amountClaim;
    uint256 private _decimals = 18;

    modifier amountZero() {
        require(
            _tokenInstance.balanceOf(_msgSender()) == 0,
            "This balance is more then 0"
        );
        _;
    }

    modifier isLive() {
        require(_islIve, "Claim not available");
        _;
    }

    constructor(address contractAddress_) {
        _tokenInstance = IERC20Token(contractAddress_);
        _amountClaim = 10 * 10**_decimals;
        _islIve = true;
    }

    function setAmountClaim(uint256 amount) external onlyOwner {
        _amountClaim = amount * 10**_decimals;
    }

    function setIsLive(bool flag) external onlyOwner {
        _islIve = flag;
    }

    function claim() public isLive amountZero {
        _tokenInstance.mint(_msgSender(), _amountClaim);
    }
}
