// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Token is ERC20, AccessControl {
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string public _name = "Gold miner token";
    string public _symbol = "GMT";

    constructor() ERC20(_name, _symbol) {
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, _msgSender());

        // Mint 100,000 tokens to msg.sender
        // 1 token = 1 * 10 ** decimals
        _mint(_msgSender(), 100000 * 10**uint256(decimals()));
    }

    /// @notice Creates `_amount` token to `_to`. Must only be called by the owner (MINTER_ROLE).
    function mint(address _to, uint256 _amount) external onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
    }

    function setRoleMint(address _account) external onlyRole(ADMIN_ROLE) {
        grantRole(MINTER_ROLE, _account);
    }
}
