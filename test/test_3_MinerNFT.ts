import { waffle, ethers, artifacts } from "hardhat";
import chai from 'chai'

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import ArtifactMinerNFT from '../artifacts/contracts/MinerNFT.sol/MinerNFT.json'
import type { MinerNFT } from '../typechain-types'
import { BigNumber } from "ethers";

const { deployContract } = waffle
const { expect } = chai

describe("MinerNFT.sol", () => {

    let instanceMinerNFT: MinerNFT;

    let accounts: SignerWithAddress[];

    let account_owner: SignerWithAddress;
    let account_1: SignerWithAddress;
    let account_2: SignerWithAddress;

    let setRoleMint = async (address: string, sender: SignerWithAddress = account_owner) => { };
    let createNFT = async (address: string, qtd: number = 1, sender: SignerWithAddress = account_owner) => { };
    let getNFTMining = async (tokenId: number): Promise<any> => { };
    let setNFTMining = async (tokenId: number, flag: boolean, SignerWithAddress = account_owner) => { };
    let getIdsNFTByOwner = async (address: string): Promise<any> => { };
    let transfer = async (to: string, tokenId: number, sender: SignerWithAddress) => { };

    beforeEach(async () => {

        // 1 - ACCOUNTS
        accounts = await ethers.getSigners();

        account_owner = accounts[0];
        account_1 = accounts[1];
        account_2 = accounts[2];

        //2 - DEPLOY CONTRACTS
        instanceMinerNFT = (await deployContract(account_owner, ArtifactMinerNFT)) as MinerNFT;

        //3 - INIT FUNCTIONS

        // setRoleMint (ADMIN_ROLE)
        setRoleMint = async (address: string, sender: SignerWithAddress = account_owner) => {
            await instanceMinerNFT.connect(sender).setRoleMint(address);
        }

        // createNFT (MINTER_ROLE)
        createNFT = async (address: string, qtd: number = 1, sender: SignerWithAddress = account_owner) => {
            let i: number = 0;
            while (i < qtd) {
                await instanceMinerNFT.connect(sender).createNFT(address);
                i++;
            }
        }

        //getNFTMining
        getNFTMining = async (tokenId: number): Promise<boolean> => {
            return await instanceMinerNFT.getNFTMining(tokenId);
        };

        // setNFTMining (MINTER_ROLE)
        setNFTMining = async (tokenId: number, flag: boolean, sender: SignerWithAddress = account_owner) => {
            await instanceMinerNFT.connect(sender).setNFTMining(tokenId, flag);
        }

        //getIdsNFTByOwner
        getIdsNFTByOwner = async (address: string): Promise<BigNumber[]> => {
            return await instanceMinerNFT.getIdsNFTByOwner(address);
        };

        //transfer token NFT
        transfer = async (to: string, tokenId: number, sender: SignerWithAddress) => {
            await instanceMinerNFT.connect(sender).transferFrom(sender.address, to, tokenId);
        }

    });

    it("Set Role and Create NFT", async () => {

        //SetRole
        await setRoleMint(account_1.address);

        let balanceBefore = await instanceMinerNFT.balanceOf(account_2.address);

        //Mint token
        await createNFT(account_2.address, 1, account_1);

        let balanceAfter = await instanceMinerNFT.balanceOf(account_2.address);

        expect(balanceBefore, "balance did not update").not.equals(balanceAfter);

    });

    it("MUST update uri - Only ADMINROLE", async () => {

        const tokeId = 0;
        const newURI = "newbaseurl.com.br/token/"

        await instanceMinerNFT.connect(account_owner).updateBaseURI(newURI);

        //Mint token
        await setRoleMint(account_owner.address);
        await createNFT(account_1.address);

        let uri = await instanceMinerNFT.tokenURI(tokeId);

        expect(`${newURI}${tokeId}`, "uri did not update").equals(uri);

    });

    it("Must get ids NFTs by owner", async () => {

        //SetRole
        await setRoleMint(account_owner.address);
        //Mint token
        await createNFT(account_1.address, 2); //Id: 0,1
        await createNFT(account_2.address, 3); //Id: 2,3,4
        await createNFT(account_1.address, 3); //Id: 5,6,7

        const idsNFTsAccount1 = [0, 1, 5, 6, 7];
        let idsNFTsAccount1_get: BigNumber[] = await getIdsNFTByOwner(account_1.address);
        let array_ids: Number[] = [0];
        array_ids.pop();

        idsNFTsAccount1_get.forEach(x => {
            array_ids.push(x.toNumber());
        });

        expect(idsNFTsAccount1, "ids did not get").to.eql(array_ids);
    });

    it("Must get NFT by id", async () => {
        //SetRole
        await setRoleMint(account_owner.address);
        //Mint token
        await createNFT(account_1.address); //Id: 0
        await createNFT(account_2.address); //Id: 1

        let tokenId = 0;

        let objectGoldMiner = await instanceMinerNFT.getNFTById(tokenId);

        //console.log(`class: ${objectGoldMiner.class} \b name: ${objectGoldMiner.name}`);

        let levelInitial = 1;
        expect(objectGoldMiner.level, "Object not obtained").to.equal(levelInitial);

    });

    it("Must get NFTs by ids", async () => {
        //SetRole
        await setRoleMint(account_owner.address);
        //Mint token
        await createNFT(account_1.address, 2); //Id: 0,1
        await createNFT(account_2.address, 3); //Id: 2,3,4
        await createNFT(account_1.address, 3); //Id: 5,6,7

        let idsNFTsAccount1_get: BigNumber[] = await getIdsNFTByOwner(account_1.address);

        let objecstGoldMiner = await instanceMinerNFT.getNFTsByIds(idsNFTsAccount1_get);

        let qtdNftsAccount1 = 5;
        expect(objecstGoldMiner.length, "Objects not obtained").to.equal(qtdNftsAccount1);

    });

    it("Must return NFT class", async () => {
        //SetRole
        await setRoleMint(account_owner.address);
        //Mint token
        await createNFT(account_1.address, 2); //Id: 0,1

        const tokenId = 0;
        let classNFT = await instanceMinerNFT.getNFTClass(tokenId);

        let classes = ["A", "B", "C", "D"];
        expect(classes, "NFT class not obtained").to.contains.any.members([classNFT]);
    });

    it("Must set and get NFT property mining - Only MintRole", async () => {
        //SetRole
        await setRoleMint(account_owner.address);
        //Mint token
        await createNFT(account_1.address, 2); //Id: 0,1

        const tokenId = 0;
        let miningBefore = await getNFTMining(tokenId);

        const flagSet = true;
        await setNFTMining(tokenId, flagSet);

        let miningAfter = await getNFTMining(tokenId);

        expect(miningBefore, "mining property not change").to.not.equal(miningAfter);
    });

    it("should not allow NFT transfer whti property mining true", async () => {
        //SetRole
        await setRoleMint(account_owner.address);
        //Mint token
        await createNFT(account_1.address, 2); //Id: 0,1

        const tokenId = 1;
        const flagSet = true; // alter to TRUE to test
        await setNFTMining(tokenId, flagSet);

        let qtsError = 0;
        try {
            await transfer(account_2.address, tokenId, account_1);
        } catch (error) {
            qtsError++;
        }

        expect(qtsError, "should conter more then 0 Error").to.not.eqls(0);
    });
});

