const Transaction = require('./transaction');
const {STARTING_BALANCE} = require('../config');
const {ec,cryptoHash} = require('../util');

class Wallet{
    constructor(){
        //console.log('In constructor of Wallet');
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }
    
    sign(data){
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({recepient, amount, chain}){
        //console.log('In createTransaction');
        if(chain){
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            })
        }
        if(amount > this.balance) throw new Error('Amount exceed balance');
        return new Transaction({senderWallet: this,recepient,amount});

    }

    static calculateBalance({chain, address}){
        let hasConductedTransaction = false;
        let outputTotal = 0;

        for (let i=chain.length - 1; i > 0 ; i--){
            const block = chain[i];

            for (let tranaction of block.data){
                if(tranaction.input.address === address){
                    hasConductedTransaction = true;
                }
                const addressOutput = tranaction.outputMap[address];

                if(addressOutput){
                    outputTotal = outputTotal + addressOutput;
                }
            }
            if(hasConductedTransaction){
                break;
            }
        }
        return hasConductedTransaction ? outputTotal : STARTING_BALANCE + outputTotal;
    }

}

module.exports = Wallet;