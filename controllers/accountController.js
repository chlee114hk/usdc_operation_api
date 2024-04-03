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

//const Account = require('../models/account');
//const User = require('../models/user');
//const Request =  require('../models/request');
const usdcContract = require('../utils/functions');
const db = require("../models");

const User = db['User'];
const Account = db['Account'];
const Request = db['Request'];

var getCount = (() => {
    var _uid = 1;
    return () => { 
        return ++_uid;;
    }
})()

const getBalance = async (req, res) => {
    const account_id = req.params.id;

    try {
        const account = await Account.findByPk(account_id, { raw: true });
        if (account) {
            res.status(200).json({balance: account.balance, locked: account.locked})
        }else{
            return res.status(500).json({error: "Account not found"});
        }
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

const depositUSD = async (req, res) => {
    const account_id = req.params.id;
    const { amount } = req.body;
    try {
        const account = await Account.findByPk(account_id);
        if (account) {
            account.balance += amount;
            await account.save();
            res.status(200).json({status: "ok", account: account.get({ plain: true })})
        }else{
            return res.status(500).json({error: "Account not found"});
        }
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

const buyUSDC = async (req, res) => {
    const account_id = req.params.id || req.body.account_id;
    const { amount } = req.body;
    try {
        const account = await Account.findByPk(account_id)
        console.log("start: ", account.balance, account.locked, account.version)
        if (account) {
            if (account.balance - account.locked >= 0) {
                account.locked += amount;
                await account.save();
                console.log("lock balance: ", account.balance, account.locked, account.version)
                let user = await User.findByPk(account.user_id);

                try {
                    await usdcContract.mint(user.wallet_address, amount).then(
                        async (result) => {
                            try {
                                console.log("minted", amount);
                                account.locked -= amount;
                                account.balance -= amount;
                                await account.save();
                                console.log("finish: ", account.balance, account.locked, account.version)
                            } catch (error) {
                                console.log("error", error)
                                console.log("Fail deducted balance: ", account.balance, account.locked, account.version)
                                let tempAccount = await Account.findByPk(account_id)
                                tempAccount.locked -= amount;
                                tempAccount.balance -= amount;
                                await tempAccount.save();
                                console.log("Correct balance: ", tempAccount.balance, tempAccount.locked, tempAccount.version)
                            }
                        }
                    )
                    return res.status(200).json({status: "ok", account: account});
                } catch (error) {
                    account.locked -= amount;
                    await account.save();
                    console.log("failed: ", account.balance, account.locked, account.version)
                    return res.status(500).json({error: "Fail to mint USDC"});
                }
            } else {
                return res.status(500).json({error: "Not enough balance"});
            }
        }else{
            return res.status(500).json({error: "Account not found"});
        }
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

const requestRedemption = async (req, res) => {
    const account_id = req.params.id || req.body.account_id;
    const { amount } = req.body;
    // try {
        const requestCount = await Request.count()
        //const address = await usdcContract.newAccount(getCount());
        const address = await usdcContract.newAccount(1 + requestCount % 100);
        console.log("new address:", address)
        const blockNumber = parseInt((await usdcContract.getBlockNumber()).toString());
        console.log("block", blockNumber)

        await usdcContract.sendTransaction(address, 0.0005)
        await usdcContract.approve(address, amount);

        const newRequest = await Request.create(
            {
                amount: amount,
                wallet_address: address,
                from_block: blockNumber,
                allow_redeem: false,
                status: 'pending',
                account_id: account_id
            }
        );
        // const redeemEnable = async () => {
        //     let request = await Request.findByPk(newRequest.id);
        //     await request.update({allow_redeem: true});
        // }
        // let subscription = await usdcContract.subscribeTransferEvent(address, amount, blockNumber, redeemEnable)
        //console.log('subscription:', subscription)
        //subscription.on('connected', (subscriptionId) => {console.log("Start subscriptionId with id:", subscriptionId)});
        res.status(200).json({request_id: newRequest.id, wallet_address: address});
    // } catch (error) {
    //     res.status(500).json({ error: error });
    // }
}

module.exports = {getBalance, depositUSD, buyUSDC, requestRedemption};