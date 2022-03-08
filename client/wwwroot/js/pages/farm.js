var farm = function () {
    return {
        dotNetReference: null,
        provider: null,
        signer: null,
        userAddress: null,
        amountInStake: 0,
        amountToHavert: 0,

        contractNFT: null,
        contractNFTFarm: null,

        init: async function (_dotNetReference) {
            this.dotNetReference = _dotNetReference;

            self.connectDisplay().isConnectedLoad(calbackConnected.bind(this));

            async function calbackConnected(connected) {
                if (connected) {
                    this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                    await this.provider.send("eth_requestAccounts", []);
                    this.signer = this.provider.getSigner();
                    this.userAddress = await this.signer.getAddress();

                    this.contractNFT = new ethers.Contract(_abiNFT.address, _abiNFT.abi, this.signer);
                    this.contractNFTFarm = new ethers.Contract(_abiNFTFarm.address, _abiNFTFarm.abi, this.signer);

                    await this.loadFarm();
                }
            }
        },
        loadFarm: async function () {
            await this.loadNFTs();
            await this.loadGridStake();
        },
        loadNFTs: async function () {
            let ids = await this.getIdsNFT();
            let nfts = await this.getNFTsByIds(ids);

            let param = this.getStructNFT(nfts);
            this.dotNetReference.invokeMethod('LoadNFTs', param);
        },
        loadGridStake: async function () {
            await this.pendingReward();
            let param = {
                amountStaked: this.amountInStake,
                amountReward: this.amountToHavert.toString()
            }
            this.dotNetReference.invokeMethod('LoadGridStake', param);
        },
        getIdsNFT: function () {
            try {
                return this.contractNFT.getIdsNFTByOwner(this.userAddress);
            } catch (e) {
                response = `${e.message}`;
                console.log(response);
            }
        },
        getNFTsByIds: function (ids) {
            try {
                return this.contractNFT.getNFTsByIds(ids);
            } catch (e) {
                response = `${e.message}`;
                console.log(response);
            }
        },
        getStructNFT: function (nfts) {
            let retur = [];
            let amount = 0;

            nfts.forEach(x => {
                retur.push({
                    id: x.id.toNumber(),
                    name: x.name,
                    class: x.class,
                    level: x.level,
                    mining: x.mining
                });
                if (x.mining)
                    amount++;
            });
            this.setAmountInStake(amount);
            return retur;
        },
        setAmountInStake: function (amount) {
            this.amountInStake = amount;
        },
        setAmountToHavert: function (amount) {
            this.amountToHavert = amount;
        },
        pendingReward: async function () {
            try {
                let balancePending = await this.contractNFTFarm.pendingReward(this.userAddress);
                balancePending = parseFloat(ethers.utils.formatUnits(balancePending, 18));
                this.setAmountToHavert(balancePending)
            } catch (e) {
                response = `${e.message}`;
                console.log(response);
            }
        },
        deposit: async function (_idToken) {
            try {

                let tx = await this.contractNFTFarm.depositNFT(_idToken);
                await tx.wait();
                await this.loadFarm();
            } catch (e) {
                response = `${e.message}`;
                console.log(response);
            }
        },
        withdraw: async function (_idToken) {
            try {

                let tx = await this.contractNFTFarm.withdrawNFT(_idToken);
                await tx.wait();
                await this.loadFarm();
            } catch (e) {
                response = `${e.message}`;
                console.log(response);
            }
        },

        harvest: async function () {
            try {

                let tx = await this.contractNFTFarm.claim();
                await tx.wait();
                await this.loadFarm();
            } catch (e) {
                response = `${e.message}`;
                console.log(response);
            }
        },

        dispose: function () {

        }

    }
}