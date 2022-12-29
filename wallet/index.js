const Transaction = require('./transaction');
const {STARTING_BALANCE} = require('../config');
const {ec,cryptoHash} = require('../util');

class Wallet{
    constructor(){
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }
    
    sign(data){
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({recepient, amount}){
        if(amount > this.balance) throw new Error('Amount exceed balance');
        return new Transaction({senderWallet: this,recepient,amount});

    }

}

module.exports = Wallet;