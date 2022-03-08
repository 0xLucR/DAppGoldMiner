import { waffle, ethers } from "hardhat";
import chai from 'chai'

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import ArtifactToken from '../artifacts/contracts/Token.sol/Token.json'
import ArtifactMinerNFT from '../artifacts/contracts/MinerNFT.sol/MinerNFT.json'
import ArtifactNFTFarm from '../artifacts/contracts/NFTFarm.sol/NFTFarm.json'

import type { Token, MinerNFT, NFTFarm } from '../typechain-types'
import { BigNumber } from "ethers";

const { deployContract } = waffle
const { expect } = chai

describe("MinerNFTFarm.sol", function () {

    let instanceToken: Token;
    let instanceMinerNFT: MinerNFT;
    let instanceNFTFarm: NFTFarm;

    let accounts: SignerWithAddress[];

    let account_owner: SignerWithAddress;
    let account_1: SignerWithAddress;
    let account_2: SignerWithAddress;
    let account_3: SignerWithAddress;

    const block_1 = 5000;
    const block_2 = 10000;
    const block_3 = 15000;
    const block_4 = 20000;

    // DECLARE Functions
    let updateBlock = async (numberBlock: number) => { };
    let setRoleMintToken = async (address: string, sender: SignerWithAddress = account_owner) => { };
    let setRoleMintNFT = async (address: string, sender: SignerWithAddress = account_owner) => { };
    let getNFTClass = async (tokenId: number): Promise<any> => { };
    let getNFTMining = async (tokenId: number): Promise<any> => { };

    let pendingReward = async (address: string): Promise<any> => { };
    let createNFT = async (address: string, qtd: number = 1, sender: SignerWithAddress = account_owner) => { };
    let depositNFT = async (idToken: number, sender: SignerWithAddress) => { };
    let withdrawNFT = async (idToken: number, sender: SignerWithAddress) => { };
    let claimReward = async (sender: SignerWithAddress) => { };
    let consoleReward = async (_address: string) => { };
    //     let consoleTokenBalance = async (_address: string) => { };

    let getPendingRewardExpected = async (_idsTokens: number[], _multiplo: number): Promise<BigNumber> => { return BigNumber.from(0); }

    beforeEach(async function () {

        // 1 - ACCOUNTS
        accounts = await ethers.getSigners();
        account_owner = accounts[0];
        account_1 = accounts[1];
        account_2 = accounts[2];
        account_3 = accounts[3];

        //2 - DEPLOY CONTRACTS
        instanceToken = (await deployContract(account_owner, ArtifactToken)) as Token
        instanceMinerNFT = (await deployContract(account_owner, ArtifactMinerNFT)) as MinerNFT
        instanceNFTFarm = (await deployContract(account_owner, ArtifactNFTFarm, [instanceToken.address, instanceMinerNFT.address])) as NFTFarm;

        //3 - INIT FUNCTIONS

        // updateBlock instanceNFTFarm
        updateBlock = async (numberBlock: number) => {
            await instanceNFTFarm.setBlock(numberBlock);
        };

        // setRoleMint Token
        setRoleMintToken = async (address: string, sender: SignerWithAddress = account_owner) => {
            await instanceToken.connect(sender).setRoleMint(address);
        }

        // setRoleMint NFT
        setRoleMintNFT = async (address: string, sender: SignerWithAddress = account_owner) => {
            await instanceMinerNFT.connect(sender).setRoleMint(address);
        }

        // getNFTClass
        getNFTClass = async (tokenId: number): Promise<string> => {
            return await instanceMinerNFT.getNFTClass(tokenId);
        };

        // getNFTMining
        getNFTMining = async (tokenId: number): Promise<boolean> => {
            return await instanceMinerNFT.getNFTMining(tokenId);
        };

        // Peding Reward
        pendingReward = async (address: string): Promise<BigNumber> => {
            return await instanceNFTFarm.pendingReward(address);
        };

        // Mint NFT
        createNFT = async (address: string, qtd: number = 1, sender: SignerWithAddress = account_owner) => {
            let i: number = 0;
            while (i < qtd) {
                await instanceMinerNFT.connect(sender).createNFT(address);
                i++;
            }
        }

        // Stake NFTs - DEPOSIT
        depositNFT = async (idToken: number, sender: SignerWithAddress) => {
            await instanceNFTFarm.connect(sender).depositNFT(idToken);
        }

        // Stake NFTs - WITHDRAW
        withdrawNFT = async (idToken: number, sender: SignerWithAddress) => {
            await instanceNFTFarm.connect(sender).withdrawNFT(idToken);
        }

        // claim Reward
        claimReward = async (sender: SignerWithAddress) => {
            await instanceNFTFarm.connect(sender).claim();
        }

        getPendingRewardExpected = async (_idsTokens: number[], _multiplo: number): Promise<BigNumber> => {


            let ret: BigNumber = BigNumber.from(0);

            let classNFT: string;


            await Promise.all(_idsTokens.map(async (id) => {
                classNFT = await getNFTClass(id);
                switch (classNFT) {
                    case "A":
                        ret = ret.add(BigNumber.from((_multiplo)).mul((0.0050 * 1e18)));
                        break;
                    case "B":
                        ret = ret.add(BigNumber.from((_multiplo)).mul((0.0032 * 1e18)));
                        break;
                    case "C":
                        ret = ret.add(BigNumber.from((_multiplo)).mul((0.0020 * 1e18)));
                        break;
                    case "D":
                        ret = ret.add(BigNumber.from((_multiplo)).mul((0.0010 * 1e18)));
                        break;

                    default:
                        break;
                }
            }));
            return ret;
        }
    });

    it("Should return Pending reward", async () => {

        // SetRole Token
        await setRoleMintToken(instanceNFTFarm.address);

        // SetRole NFT
        await setRoleMintNFT(instanceNFTFarm.address);
        await setRoleMintNFT(account_owner.address);

        //Mint token NFT
        await createNFT(account_2.address, 2, account_owner); // id: 0,1

        // Update BlockNumber
        await updateBlock(block_1);

        // Deposite - Stake
        let tokenId = 0;
        await depositNFT(tokenId, account_2);

        // Update BlockNumber
        await updateBlock(block_2);

        // Pending Reward
        let pending = await pendingReward(account_2.address);

        let idsToken = [tokenId];
        let multiple = (block_2 - block_1);
        let rewardExpected = await getPendingRewardExpected(idsToken, multiple);

        expect(pending, "reward must be equal").to.equal(rewardExpected);

    });

    it("Should deposit token NFT in stake", async () => {

        // SetRoleMint Token
        await setRoleMintToken(instanceNFTFarm.address);

        // SetRoleMint NFT
        await setRoleMintNFT(instanceNFTFarm.address);
        await setRoleMintNFT(account_owner.address);

        //Mint token NFT
        await createNFT(account_1.address, 2, account_owner); // id: 0,1
        await createNFT(account_2.address, 3, account_owner); // id: 2,3,4

        let acc1_tokenId_0 = 0;
        let acc1_tokenId_1 = 1;
        let acc2_tokenId_2 = 2;

        // Update BlockNumber
        await updateBlock(block_1);

        // Deposite - Stake
        await depositNFT(acc1_tokenId_0, account_1);

        // Update BlockNumber
        await updateBlock(block_2);

        // Deposite - Stake
        await depositNFT(acc1_tokenId_1, account_1);
        await depositNFT(acc2_tokenId_2, account_2);

        // Update BlockNumber
        await updateBlock(block_3);

        // Pending Reward
        let pendingAccount1 = await pendingReward(account_1.address);
        let pendingAccount2 = await pendingReward(account_2.address);

        //Get Pending Reward expected
        let tokensIds_acc1 = [acc1_tokenId_0, acc1_tokenId_1]
        let rewardExpected_acc1 = await getPendingRewardExpected(tokensIds_acc1, (block_3 - block_2));

        let tokensIds_acc2 = [acc2_tokenId_2]
        let rewardExpected_acc2 = await getPendingRewardExpected(tokensIds_acc2, (block_3 - block_2));

        expect(pendingAccount1, "reward must be equal account_1").to.equal(rewardExpected_acc1);
        expect(pendingAccount2, "reward must be equal account_2").to.equal(rewardExpected_acc2);

    });

    it("Should withdraw NFT in Stake and alter flag mining", async () => {

        // SetRoleMint Token
        await setRoleMintToken(instanceNFTFarm.address);

        // SetRoleMint NFT
        await setRoleMintNFT(instanceNFTFarm.address);
        await setRoleMintNFT(account_owner.address);

        //Mint token NFT
        await createNFT(account_1.address, 2, account_owner); // id: 0,1
        await createNFT(account_2.address, 3, account_owner); // id: 2,3,4

        let acc1_tokenId_0 = 0;
        let acc1_tokenId_1 = 1;
        let acc2_tokenId_2 = 2;

        // Update BlockNumber
        await updateBlock(block_1);

        // Deposite - Stake
        await depositNFT(acc1_tokenId_0, account_1);
        await depositNFT(acc1_tokenId_1, account_1);
        await depositNFT(acc2_tokenId_2, account_2);

        // Get property mining
        let miningNFT_acc1_tokenId_0_Before = await getNFTMining(acc1_tokenId_0);

        // Update BlockNumber
        await updateBlock(block_2);

        //WithDraw
        await withdrawNFT(acc1_tokenId_0, account_1);

        // Get property mining
        let miningNFT_acc1_tokenId_0_After = await getNFTMining(acc1_tokenId_0);

        // Update BlockNumber
        await updateBlock(block_3);

        // Pending Reward
        let pendingAccount1 = await pendingReward(account_1.address);
        let pendingAccount2 = await pendingReward(account_2.address);

        // Get Balance token account_1
        let balanceToken_acc1 = await instanceToken.balanceOf(account_1.address);

        //Get Pending Reward expected
        let tokensIds_acc1 = [acc1_tokenId_0, acc1_tokenId_1]
        let rewardExpectedBefore_acc1 = await getPendingRewardExpected(tokensIds_acc1, (block_2 - block_1));
        tokensIds_acc1 = [acc1_tokenId_1]
        let rewardExpectedAfter_acc1 = await getPendingRewardExpected(tokensIds_acc1, (block_3 - block_2));

        let tokensIds_acc2 = [acc2_tokenId_2]
        let rewardExpected_acc2 = await getPendingRewardExpected(tokensIds_acc2, (block_3 - block_1));

        expect(miningNFT_acc1_tokenId_0_Before, "mining must be true").to.true;
        expect(miningNFT_acc1_tokenId_0_After, "mining must be false").to.false;
        expect(balanceToken_acc1, "balance must be equal rewardBefore").to.equal(rewardExpectedBefore_acc1);
        expect(pendingAccount1, "reward acc1 must be equal").to.equal(rewardExpectedAfter_acc1);
        expect(pendingAccount2, "reward acc2 must be equal").to.equal(rewardExpected_acc2);

    });

    it("should claim reward NFT Stake", async () => {
        // SetRoleMint Token
        await setRoleMintToken(instanceNFTFarm.address);

        // SetRoleMint NFT
        await setRoleMintNFT(instanceNFTFarm.address);
        await setRoleMintNFT(account_owner.address);

        //Mint token NFT
        await createNFT(account_1.address, 2, account_owner); // id: 0,1
        await createNFT(account_2.address, 3, account_owner); // id: 2,3,4

        let acc1_tokenId_0 = 0;
        let acc1_tokenId_1 = 1;
        let acc2_tokenId_2 = 2;
        let acc2_tokenId_3 = 3;

        // Update BlockNumber
        await updateBlock(block_1);

        // Deposite - Stake
        await depositNFT(acc1_tokenId_0, account_1);
        await depositNFT(acc1_tokenId_1, account_1);
        await depositNFT(acc2_tokenId_2, account_2);
        await depositNFT(acc2_tokenId_3, account_2);

        // Update BlockNumber
        await updateBlock(block_2);

        //Claim
        await claimReward(account_1);

        // Update BlockNumber
        await updateBlock(block_3);

        //Claim
        await claimReward(account_2);

        // Update BlockNumber
        await updateBlock(block_4);

        // Get Balance token
        let balanceToken_acc1 = await instanceToken.balanceOf(account_1.address);
        let balanceToken_acc2 = await instanceToken.balanceOf(account_2.address);

        // Pending Reward
        let pendingAccount1 = await pendingReward(account_1.address);
        let pendingAccount2 = await pendingReward(account_2.address);

        //Get Pending Reward expected
        let tokensIds_acc1 = [acc1_tokenId_0, acc1_tokenId_1]
        let rewardExpectedBefore_acc1 = await getPendingRewardExpected(tokensIds_acc1, (block_2 - block_1));
        let rewardExpectedAfter_acc1 = await getPendingRewardExpected(tokensIds_acc1, (block_4 - block_2));

        let tokensIds_acc2 = [acc2_tokenId_2, acc2_tokenId_3]
        let rewardExpectedBefore_acc2 = await getPendingRewardExpected(tokensIds_acc2, (block_3 - block_1));
        let rewardExpectedAfter_acc2 = await getPendingRewardExpected(tokensIds_acc2, (block_4 - block_3));

        expect(balanceToken_acc1, "balance must be equal rewardBefore acc1").to.equal(rewardExpectedBefore_acc1);
        expect(balanceToken_acc2, "balance must be equal rewardBefore acc2").to.equal(rewardExpectedBefore_acc2);
        expect(pendingAccount1, "reward acc1 must be equal").to.equal(rewardExpectedAfter_acc1);
        expect(pendingAccount2, "reward acc2 must be equal").to.equal(rewardExpectedAfter_acc2);
    });

});

