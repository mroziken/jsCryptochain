const Transaction = require('../wallet/transaction');

class TransactionMinner{
    constructor({blockchain, transactionPool, wallet, pubsub}){
        console.log('In constructor of TransactionMinner');
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }
    
    mineTransaction(){
        console.log('In mineTransaction');
        const validTransactions = this.transactionPool.validTransactions();
        validTransactions.push(Transaction.rewardTransaction({minerWallet: this.wallet}));
        this.blockchain.addBlock({data: validTransactions});
        this.pubsub.broadcastChain();
        this.transactionPool.clear();
    }
}

module.exports = TransactionMinner;