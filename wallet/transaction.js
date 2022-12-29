const uuid = require('uuid/v1');

class Transaction{
    constructor({senderWallet, recepient, amount}){
        this.id = uuid();
        this.outputMap = this.createOutputMap({senderWallet,recepient,amount});
    }

    createOutputMap({senderWallet,recepient,amount}){
        const outputMap = {};

        outputMap[recepient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }
}

module.exports = Transaction;