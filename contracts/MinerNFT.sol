// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";

contract MinerNFT is ERC721, AccessControl {
    using SafeMath for uint256;

    string public _name = "Gold miner NFT";
    string public _symbol = "GM_NFT";

    string private _baseTokenURI;

    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint32 private _initialLevel = 1;
    bool private _initialFlagMining = false;

    event NewMinerNFT(
        address _to,
        uint256 tokenId,
        string name,
        string class,
        uint32 level
    );

    struct GoldMiner {
        uint256 id;
        string name;
        string class;
        uint32 level;
        bool mining;
    }

    GoldMiner[] private goldMinersNFT;

    constructor() ERC721(_name, _symbol) {
        //Grant the contract deployer the default admin role: it will be able
        //to grant and revoke any roles

        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, _msgSender());
    }

    function updateBaseURI(string calldata baseTokenURI)
        external
        onlyRole(ADMIN_ROLE)
    {
        _baseTokenURI = baseTokenURI;
    }

    function setRoleMint(address _account) external onlyRole(ADMIN_ROLE) {
        grantRole(MINTER_ROLE, _account);
    }

    function setNFTMining(uint256 tokenId, bool _flag)
        external
        onlyRole(MINTER_ROLE)
    {
        goldMinersNFT[tokenId].mining = _flag;
    }

    function createNFT(address _to) external onlyRole(MINTER_ROLE) {
        (
            string memory generateName,
            string memory clagenerateClassss
        ) = _generateRandomClassName(_to);
        _createNFT(_to, generateName, clagenerateClassss);
    }

    /********************
     *** SESSION GETs ***
     *********************/
    function getIdsNFTByOwner(address _owner)
        external
        view
        returns (uint256[] memory result)
    {
        result = new uint256[](balanceOf(_owner));
        uint256 counter = 0;
        for (uint256 i = 0; i < goldMinersNFT.length; i++) {
            if (ownerOf(i) == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function getNFTsByIds(uint256[] memory _ids)
        external
        view
        returns (GoldMiner[] memory result)
    {
        result = new GoldMiner[](_ids.length);

        for (uint256 i = 0; i < _ids.length; i++) {
            result[i] = goldMinersNFT[_ids[i]];
        }
        return result;
    }

    function getNFTClass(uint256 _id)
        external
        view
        returns (string memory class)
    {
        return getNFTById(_id).class;
    }

    function getNFTMining(uint256 _id) public view returns (bool mining) {
        return getNFTById(_id).mining;
    }

    function getNFTById(uint256 _id) public view returns (GoldMiner memory) {
        return goldMinersNFT[_id];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        require(
            !getNFTMining(tokenId),
            "Transfer from this NFT is not allowed, remove the Farm first."
        );
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // OVERRIDE (ERC721, AccessControl)
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _createNFT(
        address _to,
        string memory _nameParam,
        string memory _classParam
    ) internal {
        uint256 tokenId = goldMinersNFT.length;
        goldMinersNFT.push(
            GoldMiner(
                tokenId,
                _nameParam,
                _classParam,
                _initialLevel,
                _initialFlagMining
            )
        );

        _safeMint(_to, tokenId); //Method ERC721

        emit NewMinerNFT(_to, tokenId, _nameParam, _classParam, _initialLevel);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /********************
     *** SESSION RANDON ***
     *********************/
    function _generateRandomClassName(address _to)
        private
        view
        returns (string memory generateName, string memory generateClass)
    {
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.difficulty,
                    block.timestamp,
                    blockhash(block.number),
                    _to
                )
            )
        ) % 1000;

        if (rand > 0 && rand < 501) {
            generateName = "Marty";
            generateClass = "D";
        }
        if (rand > 500 && rand < 751) {
            generateName = "Rock";
            generateClass = "C";
        }
        if (rand > 750 && rand < 901) {
            generateName = "Bruce";
            generateClass = "B";
        }
        if (rand > 900 && rand < 1001) {
            generateName = "Zander";
            generateClass = "A";
        }

        return (generateName, generateClass);
    }
}
