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

//const Request =  require('../models/request');
//const Account =  require('../models/account');
const usdcContract = require('../utils/functions');
const db = require("../models");
const Account = db['Account'];
const Request = db['Request'];

const checkDeposit = async (request) => {
    let eventFilter = usdcContract.getPastTransferEvents(request.from_block)

    let getDepositSumFromEvent = (total, event) => {
        let transaction = event.returnValues;
        total = 0;
        if (transaction.to == request.wallet_address) {
           total += parseFloat(usdcContract.fromWei(transaction.value.toString()))
        }
        return total
    }
    
    let deposit = 0

    // eventFilter.then(
    //     async (events) => {
    //         console.log(events)
    //         deposit = events.reduce(getDepositSumFromEvent, 0)

    //         if (deposit >= request.amount) {
    //             await request.update({allow_redeem: true});
    //         }
    //     }
    // )

    const processEvents = async () => {
        const events = await eventFilter;
        console.log("Event:", events);
        deposit = events.reduce(getDepositSumFromEvent, 0);
    
        if (deposit >= request.amount) {
            await request.update({ allow_redeem: true });
        }
    }

    await processEvents()
}

const redeem = async (req, res) => {
    const request_id = req.params.id || req.body.request_id;
    const request = await Request.findByPk(request_id);
    
    if (request) {
        await checkDeposit(request)

        console.log("can redeem?", request.allow_redeem)

        if (request.allow_redeem && request.status == "pending") {
            let account =  await Account.findByPk(request.account_id);
            await request.update({ status: "processing"});
            console.log("Start redemption")
            await usdcContract.transferFrom(request.wallet_address, request.amount);
            console.log("Transfered USDC for burn")
            await usdcContract.burn(request.amount);
            console.log(`Finish burning ${request.amount} USDC`)
            account.balance += request.amount;
            await account.save();
            console.log("Updated Fiat USD acount balance")
            await request.update({ status: "completed"});
            console.log("End redemption")
            return res.status(200).json({status: "ok", account: account});
        } else {
            return res.status(500).json({error: "Required amount of USDC not yet received or redemption completed"})
        }
    } else {
        return res.status(500).json({error: "Request not found"});
    }
}

module.exports = {redeem};