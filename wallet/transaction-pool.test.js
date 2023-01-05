const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet;
    
    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();

        transaction = new Transaction({
            senderWallet, 
            recepient: 'fake-recepient', 
            amount: 50
        });
    });
    describe('set Transaction', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });
    describe ('existingTransaction()', () => {
        it('returns existing transaction given it exist in the tranaction pool', () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.existingTransaction({inputAddress: senderWallet.publicKey})).toBe(transaction);
        });
    });

    describe('Valid transaction()', () => {
        let validTransactions, errorMock

        beforeEach(() => {
            errorMock = jest.fn();
            global.console.error = errorMock;
            validTransactions = [];

            for (i=0; i<10; i++){
                transaction = new Transaction({
                    senderWallet,
                    recepient: "any-recepient"+i,
                    amount: 30
                });

                if (i%3 === 0){
                    transaction.input.amount = 999999;
                } else if(i%3 === 1){
                    transaction.input.signature = new Wallet().sign('foo');
                } else{
                    validTransactions.push(transaction);
                }

                transactionPool.setTransaction(transaction);
            }
        });

        it('returns valid transaction ', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });
        it('logs error for the invalid transactions', () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });
    describe('clear()', () => {
        it('clears the transaction in the pool', () => {
            transactionPool.clear();
            expect(transactionPool.transactionMap).toEqual({});
        });
    });
    describe('clearBlockchainTransactions()', () => {
        it('clears the accepted transactions in the blockchain from the pool', () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for(let i=0; i<6; i++){
                const tranaction = new Wallet().createTransaction({
                    recepient: 'foo',
                    amount: 20
                });

                transactionPool.setTransaction(tranaction);

                if(i%2 ===0){
                    blockchain.addBlock({data: [tranaction]});
                } else{
                    expectedTransactionMap[tranaction.id] = tranaction;
                }
            }

            transactionPool.clearBlockchainTransactions({chain: blockchain.chain});
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
})