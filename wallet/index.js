const Transaction = require('./transaction');
const {STARTING_BALANCE} = require('../config');
const {ec,cryptoHash} = require('../util');

class Wallet{
    constructor(){
        console.log('In constructor of Wallet');
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

    static calculateBalance({chain, address}){
        let outputTotal = 0;

        for (let i=1; i<chain.length; i++){
            const block = chain[i];

            for (let tranaction of block.data){
                const addressOutput = tranaction.outputMap[address];

                if(addressOutput){
                    outputTotal = outputTotal + addressOutput;
                }
            }
        }
        return STARTING_BALANCE + outputTotal;
    }

}

module.exports = Wallet;