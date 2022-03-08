import { waffle, ethers } from "hardhat";
import chai from 'chai'

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import ArtifactToken from '../artifacts/contracts/Token.sol/Token.json'
import ArtifactTokenClaim from '../artifacts/contracts/TokenClaim.sol/TokenClaim.json'
import type { Token, TokenClaim } from '../typechain-types'
import { BigNumber } from "ethers";

const { deployContract } = waffle
const { expect } = chai

describe("TokenClaim.sol", function () {

    let instanceToken: Token;
    let instanceTokenClaim: TokenClaim;

    let accounts: SignerWithAddress[];

    let account_owner: SignerWithAddress;
    let account_1: SignerWithAddress;
    let account_2: SignerWithAddress

    let setRoleMintToken = async (address: string, sender: SignerWithAddress = account_owner) => { };
    let claimToken = async (sender: SignerWithAddress) => { };
    let getBalance = async (adrdress: string): Promise<any> => { };

    beforeEach(async function () {

        // 1 - ACCOUNTS
        accounts = await ethers.getSigners();

        account_owner = accounts[0];
        account_1 = accounts[1];
        account_2 = accounts[2];

        //2 - DEPLOY CONTRACTS
        instanceToken = (await deployContract(account_owner, ArtifactToken)) as Token;
        instanceTokenClaim = (await deployContract(account_owner, ArtifactTokenClaim, [instanceToken.address])) as TokenClaim;

        //3 - INIT FUNCTIONS

        // setRoleMint Token
        setRoleMintToken = async (address: string, sender: SignerWithAddress = account_owner) => {
            await instanceToken.connect(sender).setRoleMint(address);
        }

        // claimToken
        claimToken = async (sender: SignerWithAddress) => {
            await instanceTokenClaim.connect(sender).claim();
        };

        // GetBalance
        getBalance = async (adrdress: string): Promise<BigNumber> => {
            return await instanceToken.balanceOf(account_2.address);
        }

    });

    it("Flag isLive - update flag isLive", async () => {

        await setRoleMintToken(instanceTokenClaim.address)

        let flag = true;

        await instanceTokenClaim.connect(account_owner).setIsLive(flag);
        await claimToken(account_2);
    });

    it("Token Claim - allow claim token", async () => {

        let amountClaim = 10;
        await setRoleMintToken(instanceTokenClaim.address);

        let balancebefore = await getBalance(account_2.address);
        await claimToken(account_2);
        let balanceAfter = await getBalance(account_2.address);

        expect(balancebefore, "balance not changed").not.equals(balanceAfter);
        expect(balanceAfter.toString(), "balance not is equals").equals((amountClaim * 1e18).toString());

    });

    it("Must update amount claim ", async () => {

        await setRoleMintToken(instanceTokenClaim.address)

        let amountClaim = 50;
        await instanceTokenClaim.connect(account_owner).setAmountClaim(amountClaim);


        let [balancebefore1, balancebefore2] = await Promise.all([
            getBalance(account_1.address),
            getBalance(account_2.address)
        ]);

        await Promise.all([claimToken(account_1), claimToken(account_2)]);

        let [balanceAfter1, balanceAfter2] = await Promise.all([
            getBalance(account_1.address),
            getBalance(account_2.address)
        ]);

        expect(balancebefore1, "balance not changed").not.equals(balanceAfter1);
        expect(balanceAfter2.toString(), "balance not is equals").equals((amountClaim * 1e18).toString());
    });



});

