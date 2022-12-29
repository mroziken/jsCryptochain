const Transaction = require('./transaction');
const Wallet = require('./index');

describe("Transaction", () => {
    let transaction, senderWallet, recepient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recepient = 'recepient-public-key';
        amount = 50;
        transaction = new Transaction({senderWallet,recepient,amount});
    });
    
    it('has in `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('has in `outputMat`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });
        it('output the amount to the recepient', () => {
            expect(transaction.outputMap[recepient]).toEqual(amount);
        });
        it('output the remeining balance for the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    })
})