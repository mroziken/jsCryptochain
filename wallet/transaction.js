const uuid = require('uuid/v1');
const { verifySignature } = require('../util');
const { REWARD_INPUT, MINING_REWARD} = require('../config');

class Transaction{
    constructor({senderWallet, recepient, amount,outputMap, input}){
        this.id = uuid();
        this.outputMap = outputMap || this.createOutputMap({senderWallet,recepient,amount});
        this.input = input || this.createInput({senderWallet, outputMap: this.outputMap});
    }

    createOutputMap({senderWallet,recepient,amount}){
        const outputMap = {};

        outputMap[recepient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    createInput({senderWallet, outputMap}){
        const input = {};
        input.timestamp = Date.now();
        input.amount = senderWallet.balance;
        input.address = senderWallet.publicKey;
        input.signature = senderWallet.sign(outputMap);
        return input;
    }

    update({senderWallet, recepient, amount}){
        if(amount > this.outputMap[senderWallet.publicKey]){
            throw new Error('Amount exceeds balance');
        }

        if (!this.outputMap[recepient]){
            this.outputMap[recepient]=amount;
        }
        else{
            this.outputMap[recepient] = this.outputMap[recepient] + amount;
        }
        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
        this.input = this.createInput({senderWallet,outputMap: this.outputMap});
    }

    static rewardTransaction({minerWallet}){
        return new this({
            input: REWARD_INPUT,
            outputMap: { [minerWallet.publicKey]: minerWallet.balance + MINING_REWARD}
        });
    }

    static validTransaction(transaction){
        const {input: {address, amount, signature}, outputMap} = transaction;
        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);
        if (amount !== outputTotal){
            console.error(`Ivalid transaction from ${address}, amount: ${amount}, outputTotal: ${outputTotal}`);
            console.error(outputMap);
            return false;
        }

        if(!verifySignature({publicKey:address, data: outputMap, signature})){
            console.error(`Ivalid signagture from ${address}`);
            return false;
        }
        return true;
    }
}

module.exports = Transaction;