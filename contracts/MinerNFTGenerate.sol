// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);
}

interface IMinerNFT {
    function createNFT(address _to) external;
}

contract MinerNFTGenerate is Ownable {
    IERC20 private immutable _tokenInstance;
    IMinerNFT private immutable _nftInstace;
    uint256 private _amountGenerate;
    uint256 private constant _decimals = 18;

    modifier amountAllowance() {
        require(
            _tokenInstance.allowance(_msgSender(), address(this)) >=
                _amountGenerate,
            "Funds not allowed"
        );
        _;
    }

    constructor(address contractAddressToken_, address contractAddressNFT_) {
        _tokenInstance = IERC20(contractAddressToken_);
        _nftInstace = IMinerNFT(contractAddressNFT_);
        _amountGenerate = 10 * 10**_decimals;
    }

    function setAmountGenerate(uint256 amount) external onlyOwner {
        _amountGenerate = amount * 10**_decimals;
    }

    // ALERT: msg.sender need to approve address(this) before to transfer the tokens(amountGenerate)
    function createNFT() public amountAllowance {
        if (
            _tokenInstance.transferFrom(
                _msgSender(),
                address(this),
                _amountGenerate
            )
        ) _nftInstace.createNFT(_msgSender());
    }

    function cleanTokenAirDrop() public onlyOwner returns (bool) {
        return
            _tokenInstance.transfer(
                owner(),
                _tokenInstance.balanceOf(address(this))
            );
    }
}
