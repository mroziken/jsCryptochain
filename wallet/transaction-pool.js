const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
        console.log('In consturctor of TransactionPool');
        this.transactionMap = {};
    }

    setTransaction(transaction){
        this.transactionMap[transaction.id]=transaction;
    }

    existingTransaction({inputAddress}){
        const transactions = Object.values(this.transactionMap);

        return transactions.find( transaction => transaction.input.address === inputAddress)
    }

    replaceTransactionMap(transactionMap){
        this.transactionMap = transactionMap;
    }

    validTransactions(){
        return Object.values(this.transactionMap).filter( transaction => Transaction.validTransaction(transaction));
    }

    clear(){
        this.transactionMap = {};
    }

    clearBlockchainTransactions({chain}){
       for (let i=1; i<chain.length; i++){
        const block = chain[i];
        for (let tranaction of block.data){
            if(this.transactionMap[tranaction.id]){
                delete this.transactionMap[tranaction.id];
            }
        }
       }
    }
}

module.exports = TransactionPool;