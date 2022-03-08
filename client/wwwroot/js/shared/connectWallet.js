var connectDisplay = function () {
    return {
        dotNetReference: null,

        init: function (_dotNetReference) {
            this.dotNetReference = _dotNetReference;

            if (!this.isMetaMaskInstalled()) {
                //If it isn't installed we ask the user to click to install it
                alert('MetaMask not installed!');
                return null;
            }
            else
                return this.getAccountConnected(this.connectAccounts.bind(this));
        },
        isMetaMaskInstalled: function () {
            //Have to check the ethereum binding on the window object to see if it's installed
            const { ethereum } = window;
            return Boolean(ethereum && ethereum.isMetaMask);
        },
        getAccountConnectedServer: function () {
            return this.getAccountConnected(this.returnAccount.bind(this));
        },
        getAccountConnected: function (callback) {
            return ethereum
                .request({ method: 'eth_accounts' })
                .then(callback)
                .catch((error) => {
                    console.error(error);
                });
        },
        returnAccount: function (accounts) {
            if (!accounts || accounts.length === 0)
                return null;
            return accounts[0];
        },
        connect: function () {
            if (!this.isMetaMaskInstalled()) {
                //If it isn't installed we ask the user to click to install it
                alert('MetaMask not installed!');
                return null;
            } else {

                function callback(result) {
                    return this.connectAccounts(result);
                }

                return ethereum
                    .request({ method: 'eth_requestAccounts' })
                    .then(callback.bind(this))
                    .catch((error) => {
                        if (error.code === 4001) {
                            // EIP-1193 userRejectedRequest error
                            alert('Please connect to MetaMask.');
                        } else {
                            console.error(error);
                        }
                    });
            }
        },
        connectAccounts: function (accounts) {
            var account = this.returnAccount(accounts);
            if (account == null)
                return account;

            // Um ​​Web3Provider envolve um provedor Web3 padrão, que é
            // o que MetaMask injeta como window.ethereum em cada página
            // The "any" network will allow spontaneous network changes
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

            // Handle the new accounts, or lack thereof.
            // "accounts" will always be an array, but it can be empty
            ethereum.removeListener('accountsChanged', this.handleAccountsChanged.bind(this));
            ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));

            provider.on("network", (newNetwork, oldNetwork) => {
                // When a Provider makes its initial connection, it emits a "network"
                // event with a null oldNetwork along with the newNetwork. So, if the
                // oldNetwork exists, it represents a changing network
                if (oldNetwork) {
                    this.handleAccountsChanged("");
                }
            });

            return account;
        },
        handleAccountsChanged: function (accounts) {
            let account = this.returnAccount(accounts);
            if (!account)
                ethereum.removeListener('accountsChanged', this.handleAccountsChanged.bind(this));
            this.dotNetReference.invokeMethodAsync('ChangeAccount');
        },

        isConnectedLoad: async function (callbackLoad) {
            let account = await this.getAccountConnected(this.returnAccount);
            let connected = account != null;

            callbackLoad(connected);
        },

        dispose: function () {

        }
    }
}