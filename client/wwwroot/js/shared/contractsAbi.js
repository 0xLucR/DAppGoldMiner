const _abiToken = {
    address: "0xF468777F654c3d625b854d53cddF810Ba1bF4289",
    abi: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address _owner) public view returns (uint256 balance)",
        "function transfer(address _to, uint256 _value) public returns (bool success)",
        "function approve(address spender, uint256 amount) public virtual override returns (bool)",
    ],
};

const _abiTokenClaim = {
    address: "0x858B2a6b3C19dAA17F47074A2BE44B9F452a8381",
    abi: [
        "function setAmountClaim(uint256 _amount) external onlyOwner",
        "function claim() public isLive amountZero",
    ],
};

const _abiNFT = {
    address: "0x8D17cB045eC9B5BfC4338F1dED87Ab7a8EE92305",
    abi: [
        "function getIdsNFTByOwner(address _owner) external view returns(uint256[] memory result)",
        "function getNFTById(uint256 _id) external view returns(tuple(uint256 id, string name, string class, uint32 level, bool mining) memory)",
        "function getNFTsByIds(uint256[] memory _ids) external view returns(tuple(uint256 id, string name, string class, uint32 level, bool mining)[] memory result)"
    ],
};

const _abiNFTGenerate = {
    address: "0xeE4e2d6A53517D3d3A8479a504B8aFf286c7D6d1",
    abi: [
        "function createNFT() public amountAllowance",
    ],
};

const _abiNFTFarm = {
    address: "0xca116d67C916C05CD31aAB1E117c49b86B733888",
    abi: [
        "function setBlock(uint256 _block) public",
        "function pendingReward(address _userAddress) public view returns (uint256)",
        "function depositNFT(uint256 _tokenId) external",
        "function withdrawNFT(uint256 _tokenId) external",
        "function claim() external"
    ],
};