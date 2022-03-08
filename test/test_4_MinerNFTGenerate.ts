import { waffle, ethers } from "hardhat";
import chai from 'chai'

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import ArtifactToken from '../artifacts/contracts/Token.sol/Token.json';
import ArtifactMinerNFT from '../artifacts/contracts/MinerNFT.sol/MinerNFT.json';
import ArtifactMinerNFTGenerate from '../artifacts/contracts/MinerNFTGenerate.sol/MinerNFTGenerate.json';

import type { Token, MinerNFT, MinerNFTGenerate } from '../typechain-types';
import { BigNumber, ContractTransaction } from "ethers";

const { deployContract } = waffle
const { expect } = chai



describe("MinerNFTGenarate.sol", () => {

    let instanceToken: Token;
    let instanceMinerNFT: MinerNFT;
    let instanceMinerNFTGenerate: MinerNFTGenerate;

    let accounts: SignerWithAddress[];

    let account_owner: SignerWithAddress;
    let account_1: SignerWithAddress;
    let account_2: SignerWithAddress;

    const baseDecimals = 1e18;

    let setRoleMintToken = async (address: string, sender: SignerWithAddress = account_owner) => { };
    let approveToken = async (spender: string, amount: BigNumber, sender: SignerWithAddress) => { };
    let mintToken = async (address: string, amountMint: number, sender: SignerWithAddress = account_owner) => { };

    let setRoleMintNFT = async (address: string, sender: SignerWithAddress = account_owner) => { };
    let getIdsNFTByOwner = async (address: string): Promise<any> => { };

    let createNFT = async (sender: SignerWithAddress) => { };
    let cleanContract = async (sender: SignerWithAddress = account_owner): Promise<any> => { };


    beforeEach(async () => {

        // 1 - ACCOUNTS
        accounts = await ethers.getSigners();

        account_owner = accounts[0];
        account_1 = accounts[1];
        account_2 = accounts[2];

        //2 - DEPLOY CONTRACTS
        instanceToken = (await deployContract(account_owner, ArtifactToken)) as Token;
        instanceMinerNFT = (await deployContract(account_owner, ArtifactMinerNFT)) as MinerNFT;
        instanceMinerNFTGenerate = (await deployContract(account_owner, ArtifactMinerNFTGenerate, [instanceToken.address, instanceMinerNFT.address])) as MinerNFTGenerate;

        //3 - INIT FUNCTIONS

        // setRoleMint Token - (Admin ROle)
        setRoleMintToken = async (address: string, sender: SignerWithAddress = account_owner) => {
            await instanceToken.connect(sender).setRoleMint(address);
        }

        // Approve Token to Transfer
        approveToken = async (spender: string, amount: BigNumber, sender: SignerWithAddress) => {
            await instanceToken.connect(sender).approve(spender, amount);
        };

        // mintTOken - (RoleMint)
        mintToken = async (address: string, amountMint: number, sender: SignerWithAddress = account_owner) => {
            let amount = (amountMint * 1e18).toString();
            await instanceToken.connect(sender).mint(account_2.address, amount);
        };

        // setRoleMint NFT (Admin Role)
        setRoleMintNFT = async (address: string, sender: SignerWithAddress = account_owner) => {
            await instanceMinerNFT.connect(sender).setRoleMint(address);
        };

        //getIdsNFTByOwner - instanceMinerNFT
        getIdsNFTByOwner = async (address: string): Promise<BigNumber[]> => {
            return await instanceMinerNFT.getIdsNFTByOwner(address);
        };


        // Create NFT - instanceMinerNFTGenerate
        createNFT = async (sender: SignerWithAddress) => {
            await instanceMinerNFTGenerate.connect(sender).createNFT();
        };

        cleanContract = async (sender: SignerWithAddress = account_owner): Promise<ContractTransaction> => {
            return await instanceMinerNFTGenerate.connect(sender).cleanTokenAirDrop();
        };



    });

    it("Create NFT - Require Tokens", async () => {
        let amountMint = 10;

        // SetRole Token
        await setRoleMintToken(account_1.address);
        await mintToken(account_2.address, amountMint, account_1);

        // SetRole NFT
        await setRoleMintNFT(instanceMinerNFTGenerate.address);

        // Approve token for spend
        let amountMintBigNumber = BigNumber.from((amountMint * baseDecimals).toString());
        await approveToken(instanceMinerNFTGenerate.address, amountMintBigNumber, account_2);
        await createNFT(account_2);

        let balance = await getIdsNFTByOwner(account_2.address);

        const expectedBalance = 1;
        expect(balance.length, "NFT not Minted").to.equal(expectedBalance);

    });



    it("Set amount token for generate NFT - Only Owner", async () => {

        let amountGenerate = 45;

        //SetRole Token
        await setRoleMintToken(account_1.address);
        await mintToken(account_2.address, amountGenerate, account_1);

        // SetRole NFT
        await setRoleMintNFT(instanceMinerNFTGenerate.address);

        // Update amount Token Generato
        await instanceMinerNFTGenerate.connect(account_owner).setAmountGenerate(amountGenerate);

        // Approve token for spend
        let amountMintBigNumber = BigNumber.from((amountGenerate * baseDecimals).toString());
        await approveToken(instanceMinerNFTGenerate.address, amountMintBigNumber, account_2);

        // Create NFT
        let balanceContractBefore = await instanceToken.balanceOf(instanceMinerNFTGenerate.address);
        await createNFT(account_2);
        let balanceContractAfter = await instanceToken.balanceOf(instanceMinerNFTGenerate.address);

        expect(balanceContractBefore, "balance incorrect").to.not.equal(balanceContractAfter);
        expect(balanceContractAfter, "balance incorrect").to.equal(amountMintBigNumber);
    });



    it("Clear Token AirDrop - Only Owner", async () => {

        let amountGenerate = 10;

        //SetRole Token
        await setRoleMintToken(account_1.address);
        await mintToken(account_2.address, amountGenerate, account_1);

        //SetRole NFT
        await setRoleMintNFT(instanceMinerNFTGenerate.address);

        // Approve token for spend
        let amountMintBigNumber = BigNumber.from((amountGenerate * baseDecimals).toString());
        await approveToken(instanceMinerNFTGenerate.address, amountMintBigNumber, account_2);

        // Create NFT
        await createNFT(account_2);
        let balanceContractBefore = await instanceToken.balanceOf(instanceMinerNFTGenerate.address);
        let balanceOwnerBefore = await instanceToken.balanceOf(account_owner.address);

        // Clean Contract
        await cleanContract();
        let balanceContractAfter = await instanceToken.balanceOf(instanceMinerNFTGenerate.address);
        let balanceOwnerAfter = await instanceToken.balanceOf(account_owner.address);

        let balanceOwnerExpect = balanceOwnerBefore.add(balanceContractBefore);
        let balanceContractExpected = 0;

        expect(balanceContractBefore, "balance incorrect - != B/A").to.not.equal(balanceContractAfter);
        expect(balanceContractAfter, "balance incorrect - == A/E").to.equal(balanceContractExpected);
        expect(balanceOwnerAfter, "balance incorrect - Owner").to.equal(balanceOwnerExpect);

    });

});