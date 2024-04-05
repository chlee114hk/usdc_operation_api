// Copyright 2024 vincentlee
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {Web3} = require('web3')
const usdc = require("./contract");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const config = { 
    MNEMONIC: "" || process.env.MNEMONIC, 
    INFURA_KEY: "" || process.env.INFURA_KEY,
    NETWORK: "" || process.env.NETWORK
};
const OPTIONS = {
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 500,
    transactionPollingTimeout: 20000
};

const account_password = process.env.ACCOUNT_ENCRYPT_PASSWORD;
const chain_id = process.env.CHAIN_ID

if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider); 
} else {
    const provider = new HDWalletProvider(
        config.MNEMONIC,
        `https://${config.NETWORK}.infura.io/v3/${config.INFURA_KEY}`,
        0,
        100
    );
    var web3 = new Web3(provider, null, OPTIONS);
    //var web3 = new Web3(new Web3.providers.HttpProvider(`https://${config.NETWORK}.infura.io/v3/${config.INFURA_KEY}`));
}

const web3Socket = new Web3(
    new Web3.providers.WebsocketProvider(`wss://${config.NETWORK}.infura.io/ws/v3/${config.INFURA_KEY}`)
);

//const accounts = web3.eth.getAccounts();
var accounts, walletAddres;

web3.eth.getAccounts().then(
    (accounts) => {
        console.log("wallet:", accounts)
        walletAddress = accounts[0];
    }
)
    

// console.log("wallet:", accounts)
// const walletAddress = accounts[0];

const usdcContract = new web3.eth.Contract(usdc.abi, usdc.address);

exports.getAccount = async () => {
    let accounts = await web3.eth.getAccounts();
    return accounts[0]
}

exports.getAccounts = async () => {
    let accounts = await web3.eth.getAccounts();
    return accounts
}

exports.getBlockNumber = async () => {
    return web3.eth.getBlockNumber();
}

exports.fromWei = (amount) => {
    return web3.utils.fromWei(amount.toString(), 'mwei');
}

exports.mint = async (to, amount) => {
    amount = await web3.utils.toWei(amount.toString(), 'mwei');
    let walletAddress = await exports.getAccount();
    console.log("mint sent from", walletAddress)
    return usdcContract.methods.mint(to, amount).send({
        from: walletAddress
    });
}

exports.balanceOf = async (account) => {
    return usdcContract.methods.balanceOf(account).call();
}

exports.burn = async (amount) => {
    let walletAddress = await exports.getAccount();
    let txCount = await web3.eth.getTransactionCount(walletAddress, "pending");
    amount = await web3.utils.toWei(amount.toString(), 'mwei');
    return usdcContract.methods.burn(amount).send({
        from: walletAddress,
        nonce: web3.utils.toHex(txCount)
    });
}

exports.newAccount = async (num) => {
    let accounts = await exports.getAccounts();
    console.log(num, accounts, accounts.length)
    return accounts[num]
    //return web3.eth.personal.newAccount(account_password);
}

exports.sendTransaction = async (receiver, amount) => {
    let walletAddress = await exports.getAccount();
    return web3.eth.sendTransaction(
        { 
            to: receiver, 
            from: walletAddress, 
            value: web3.utils.toWei(amount.toString(), "ether")
        }
    )
}

exports.signData = async (dataToSign, address) => {
    return web3.eth.personal.sign(dataToSign, address, account_password);
}

exports.approve = async (owner, amount) => {
    let walletAddress = await exports.getAccount();
    let txCount = await web3.eth.getTransactionCount(owner, "pending");
    amount = await web3.utils.toWei(amount.toString(), 'mwei');
    let rawTransaction = {
        from: owner,
        to: usdc.address,
        data: usdcContract.methods.approve(walletAddress, amount).encodeABI(),
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(300000),
        chainId: chain_id
    }
    let tx = await web3.eth.signTransaction(rawTransaction, owner)
    //let tx = await web3.eth.personal.sign(rawTransaction, owner, account_password);
    sTx = web3.eth.sendSignedTransaction(tx.raw);

    return sTx
}

exports.transferFrom = async (from, amount) => {
    let walletAddress = await exports.getAccount();
    let txCount = await web3.eth.getTransactionCount(walletAddress, "pending");
    amount = await web3.utils.toWei(amount.toString(), 'mwei');
    console.log("txCount", txCount)
    return usdcContract.methods.transferFrom(from, walletAddress, amount).send({
        from: walletAddress,
        nonce: web3.utils.toHex(txCount)
    });
}

exports.getPastTransferEvents = (fromBlock) => {
    console.log("From Block", fromBlock)
    const eventFilter = usdcContract.getPastEvents(
        'Transfer', 
        {
            fromBlock: fromBlock,
            toBlock: 'latest',
            topics: [
                web3.utils.keccak256('Transfer(address,address,uint256)')
            ]
        }, 
        (error, event) => {console.log(events)}
    )
    return eventFilter;
}

exports.subscribeTransferEvent = async (address, amount, fromBlock, callback) => {
    console.log("block:", web3.utils.toHex(fromBlock.toString()), "keccak256", web3.utils.keccak256('Transfer(address,address,uint256)'))
    let options = {
        fromBlock: "0x35363136363835", //web3.utils.toHex(fromBlock.toString()),
        address: usdc.address,
        topics: [
            web3.utils.keccak256('Transfer(address,address,uint256)')
        ]
    };

    // usdcContract.getPastEvents('Transfer', {
    //     fromBlock: 5616960,
    //     toBlock: 'latest',
    //     topics: [
    //         web3.utils.keccak256('Transfer(address,address,uint256)')
    //     ]
    // }, function(error, events){ console.log(events); })
    // .then(function(events){
    //     console.log(events) 
    // });

    //let subscription = web3.eth.subscribe('logs', options);
    //console.log("s",subscription)
    let subscription = await web3Socket.eth.subscribe('logs', options)
    
    subscription.on('data', event => {
        console.log("event:", event)
        try {
            if (event.topics.length == 3) {
                let transaction = web3.eth.abi.decodeLog(
                    [
                        {
                            type: 'address',
                            name: 'from',
                            indexed: true
                        },
                        {
                            type: 'address',
                            name: 'to',
                            indexed: true
                        }, 
                        {
                            type: 'uint256',
                            name: 'value',
                            indexed: false
                        }
                    ],
                    event.data,
                    [event.topics[1], event.topics[2], event.topics[3]]
                );
        
                //const contract = new web3.eth.Contract(abi, event.address)

                let deposit = 0;
        
                if (transaction.to == address && event.address == usdc.address) {
                    console.log("To: ", address, "Amount: ", amount)
                    deposit += transaction.value
                    if (deposit >= amount) {
                        console.log("Detect deposit to ", address, deposit)

                        (async function() {
                            await callback();
                        })()
                    }
                }
                    
            }
        } catch (error) {
            console.log(error)
        }
    });

    return subscription;
}

