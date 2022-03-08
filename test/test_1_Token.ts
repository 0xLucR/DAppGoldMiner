import { waffle, ethers } from "hardhat";
import chai from 'chai'

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import ArtifactToken from '../artifacts/contracts/Token.sol/Token.json'
import type { Token } from '../typechain-types'
import { BigNumber } from "ethers";

const { deployContract } = waffle
const { expect } = chai

describe("Token.sol", function () {

    let instanceToken: Token;

    let accounts: SignerWithAddress[];

    let account_owner: SignerWithAddress;
    let account_1: SignerWithAddress;
    let account_2: SignerWithAddress

    let setRoleMintToken = async (address: string, sender: SignerWithAddress = account_owner) => { };
    let mintToken = async (address: string, amountMint: number, sender: SignerWithAddress = account_owner) => { };

    beforeEach(async function () {

        // 1 - ACCOUNTS
        accounts = await ethers.getSigners();

        account_owner = accounts[0];
        account_1 = accounts[1];
        account_2 = accounts[2];

        //2 - DEPLOY CONTRACTS
        instanceToken = (await deployContract(account_owner, ArtifactToken)) as Token;

        //3 - INIT FUNCTIONS

        // setRoleMint Token
        setRoleMintToken = async (address: string, sender: SignerWithAddress = account_owner) => {
            await instanceToken.connect(sender).setRoleMint(address);
        }

        // mintTOken
        mintToken = async (address: string, amountMint: number, sender: SignerWithAddress = account_owner) => {
            let amount = (amountMint * 1e18).toString();
            await instanceToken.connect(sender).mint(account_2.address, amount);
        };

    });

    it("Token SetRoleMint - allow account mint token", async () => {

        await setRoleMintToken(account_1.address);
        await mintToken(account_2.address, 30, account_1);
    });

    it("Token Mint - correct amount of minted tokens", async () => {

        await setRoleMintToken(account_1.address);

        let balancebefore = await instanceToken.balanceOf(account_2.address);

        await mintToken(account_2.address, 30, account_1);

        let balanceAfter = await instanceToken.balanceOf(account_2.address);

        expect(balancebefore, "balance not changed").not.equals(balanceAfter);
        expect(balanceAfter.toString(), "balance not equals").equals((30 * 1e18).toString());

    });

});

