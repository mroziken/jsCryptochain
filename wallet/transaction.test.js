const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');

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
        it('has `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });
        it('output the amount to the recepient', () => {
            expect(transaction.outputMap[recepient]).toEqual(amount);
        });
        it('output the remeining balance for the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    })
    describe('input', () => {
        it('has `input`', () => {
            expect(transaction).toHaveProperty('input');
        });
        it('has as `timestamp` in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });
        it('sets the `amount` to `senderWallet` balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        })
        it('sets the `address` to `senderWallet.publicKey`', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        })
        it('signs the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true)
        })
    });

    describe('validTransaction', () =>{
        let errorMock;

        beforeAll(() =>{
            errorMock = jest.fn();

            global.console.error = errorMock;
        })

        describe('when the transaction is valid', () => {
            it('returns true', () =>{
                expect(Transaction.validTransaction(transaction)).toBe(true);
            })
        });
        describe('when the transaction is invalid', () => {
            describe('and a transaction outputMap value is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 67867676;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled;
                })
            });
            describe('and a transaction input signature is invalid', () => {
                it('returns false and logs an error',  () => {
                    transaction.input.signature = new Wallet().sign('fake');
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled;
                });
            });
        });
    });

    describe('update', () => {
        let originalSignature, originalSenderOutput, nextRecepient, nextAmount;

        beforeEach(() => {
            originalSignature = transaction.input.signature;
            originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
            nextRecepient = 'next-recepient';
            nextAmount = 50;

            transaction.update({senderWallet, recepient: nextRecepient, amount: nextAmount});
        });

        it('outputs the amount of the next recepient', () => {
            expect(transaction.outputMap[nextRecepient]).toEqual(nextAmount);
        });
        it('subtracts the amount from original sender amount', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput-nextAmount);
        });
        it('maintain a total output that  matches the input amount', () => {
            expect(
                Object.values(transaction.outputMap).reduce((total, amount) => total + amount)
            ).toEqual(transaction.input.amount);
        });
        it('re-signs the transaction', () => {
            expect(transaction.input.signature).not.toEqual(originalSignature);
        });
    })
})