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

const { isAddress } = require('web3-validator');
//const User = require('../models/user');
//Const Account = require('../models/account');
const db = require("../models");
const usdcContract = require('../utils/functions');
const User = db['User'];
const Account = db['Account'];

const createUser = async (req, res) => {
    const {email, first_name, last_name, wallet_address } = req.body;
    
    if (!email) {
        return res.status(500).json({error: "Email must be provided!"}) 
    }

    if (!wallet_address) {
        return res.status(500).json({error: "Wallet Address must be provided!"}) 
    }
    
    if (!isAddress(wallet_address)) {
        return res.status(500).json({error: "Invalid Etherum wallet address!"})
    }

    try {
        const newUser = await User.create(
            {
                email: email, 
                first_name: first_name, 
                last_name: last_name, 
                wallet_address: wallet_address,
                Accounts: [
                    {
                        balance: 0,
                        locked: 0
                    }
                ]
            },
            {
                include: [Account]
            }
        );
        let accounts = await newUser.getAccounts()
        res.status(201).json({ "account_id": accounts[0].id, "user_id": newUser.id })
    } catch (error) {
        res.status(500).json({error: error});
    }
}

const getUsdcBalance = async (req, res) => {
    const user_id = req.params.id;
    const user = await User.findByPk(user_id);
    if (user) {
        const balance = await usdcContract.balanceOf(user.wallet_address);
        res.status(200).json({status: "ok", balance: usdcContract.fromWei(balance)})
    } else {
        return res.status(500).json({error: "User not found"});
    }

}

module.exports = {createUser, getUsdcBalance};