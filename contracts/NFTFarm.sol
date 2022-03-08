// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";

interface IToken is IERC20 {
    function mint(address _to, uint256 _amount) external;
}

interface IMinerNFT is IERC721 {
    function getNFTMining(uint256 _id) external view returns (bool mining);

    function getNFTClass(uint256 _id)
        external
        view
        returns (string memory class);

    function setNFTMining(uint256 tokenId, bool _flag) external;
}

contract NFTFarm is Ownable {
    using SafeMath for uint256;

    // todo: remove"
    uint256 private blockAtual = 0;

    IToken private immutable _tokenInstance;

    // uint256 public constant WEIGHT_BASE = 1e2;
    //uint256 public constant RATIO = 1e18;
    uint256 public constant REWARD_RATIO = 1e15;
    uint256 public constant RATIO = 1e15;

    //TODO: ALter for private
    uint256 public constant tokenPerBlockA = 0.0050 * 1e18;
    uint256 public constant tokenPerBlockB = 0.0032 * 1e18;
    uint256 public constant tokenPerBlockC = 0.0020 * 1e18;
    uint256 public constant tokenPerBlockD = 0.0010 * 1e18;
    //uint256 public constant tokenPerBlockD = 1 * REWARD_RATIO;

    PoolInfo public poolInfo;
    mapping(address => UserInfo) public userInfo;

    /********************
     *** SESSION EVENTS ***
     *********************/
    event Stake(address user, uint256 tokenId, uint256 amount);
    event Unstake(address user, uint256 tokenId, uint256 amount);
    event Claim(address user, uint256 amount);

    /********************
     *** SESSION MODIFIER ***
     *********************/
    modifier ownerNFT(uint256 _tokenId) {
        require(
            poolInfo.token.ownerOf(_tokenId) == _msgSender(),
            "sender does not owner the NFT"
        );
        _;
    }

    modifier staketNFT(uint256 _tokenId, bool flag) {
        require(
            poolInfo.token.getNFTMining(_tokenId) == flag,
            "NFT stake error"
        );
        _;
    }

    struct PoolInfo {
        IMinerNFT token;
    }

    struct UserInfo {
        uint256 amountClassA;
        uint256 amountClassB;
        uint256 amountClassC;
        uint256 amountClassD;
        uint256 lastRewardBlock;;
    }

    constructor(address contractAddressToken_, address contractAddressNFT_) {
        _tokenInstance = IToken(contractAddressToken_);
        poolInfo.token = IMinerNFT(contractAddressNFT_);
    }

    //TODO: REMOVE
    function setBlock(uint256 _block) public onlyOwner {
        blockAtual = _block;
    }

    // View function to see pending token reward on frontend.
    function pendingReward(address _userAddress) public view returns (uint256) {
        UserInfo memory user = userInfo[_userAddress];

        // todo: Alter blockAtual for "block.number"
        uint256 multiple = blockAtual.sub(user.lastRewardBlock);

        if (multiple <= 0) return 0;

        uint256 classA = tokenPerBlockA.mul(user.amountClassA).mul(multiple);
        uint256 classB = tokenPerBlockB.mul(user.amountClassB).mul(multiple);
        uint256 classC = tokenPerBlockC.mul(user.amountClassC).mul(multiple);
        uint256 classD = tokenPerBlockD.mul(user.amountClassD).mul(multiple);

        uint256 ret = classA.add(classB).add(classC).add(classD);

        return ret;
    }

    function depositNFT(uint256 _tokenId)
        external
        ownerNFT(_tokenId)
        staketNFT(_tokenId, false)
    {
        uint256 amountReward = pendingReward(_msgSender());
        if (amountReward > 0) claimReward(amountReward);

        //UPDATE UserInfo (lastRewardBlock and amount NFTstake)
        updateDepositUserInfo(_tokenId, _msgSender());
    }

    function withdrawNFT(uint256 _tokenId)
        external
        ownerNFT(_tokenId)
        staketNFT(_tokenId, true)
    {
        uint256 amountReward = pendingReward(_msgSender());
        if (amountReward > 0) {
            claimReward(amountReward);
        }

        //UPDATE UserInfo (lastRewardBlock and amount NFTstake)
        updateWithdrawUserInfo(_tokenId, _msgSender());
    }

    function claim() external {
        uint256 amountReward = pendingReward(_msgSender());
        claimReward(amountReward);

        //UPDATE UserInfo (lastRewardBlock)
        updateUserInfo(_msgSender());
    }

    function claimReward(uint256 _amount) internal {
        require(_amount > 0, "has no reward");
        _tokenInstance.mint(_msgSender(), _amount);
    }

    function updateUserInfo(address _userAddress) internal {
        // todo: Alter blockAtual for "block.number"
        userInfo[_userAddress].lastRewardBlock = blockAtual;
    }

    function updateDepositUserInfo(uint256 _tokenId, address _userAddress)
        internal
    {
        //SETAR NFT COMO MINING
        poolInfo.token.setNFTMining(_tokenId, true);
        UserInfo storage user = userInfo[_userAddress];

        string memory class = poolInfo.token.getNFTClass(_tokenId);

        if (compareStrings(class, "A")) {
            user.amountClassA = user.amountClassA.add(1);
        } else if (compareStrings(class, "B")) {
            user.amountClassB = user.amountClassB.add(1);
        } else if (compareStrings(class, "C")) {
            user.amountClassC = user.amountClassC.add(1);
        } else if (compareStrings(class, "D")) {
            user.amountClassD = user.amountClassD.add(1);
        }

        //UPDATE UserInfo (lastRewardBlock)
        updateUserInfo(_userAddress);
    }

    function updateWithdrawUserInfo(uint256 _tokenId, address _userAddress)
        internal
    {
        //SETAR NFT COMO NOT MINING
        poolInfo.token.setNFTMining(_tokenId, false);
        UserInfo storage user = userInfo[_userAddress];

        string memory class = poolInfo.token.getNFTClass(_tokenId);

        if (compareStrings(class, "A")) {
            user.amountClassA = user.amountClassA.sub(1);
        } else if (compareStrings(class, "B")) {
            user.amountClassB = user.amountClassB.sub(1);
        } else if (compareStrings(class, "C")) {
            user.amountClassC = user.amountClassC.sub(1);
        } else if (compareStrings(class, "D")) {
            user.amountClassD = user.amountClassD.sub(1);
        }

        //UPDATE UserInfo (lastRewardBlock)
        updateUserInfo(_userAddress);
    }

    function compareStrings(string memory a, string memory b)
        private
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }
}
