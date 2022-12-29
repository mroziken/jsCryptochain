const Wallet = require ('./index');
const {verifySignature} = require('../util');
const Transaction = require('./transaction');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a  `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `public key`', () => {
        expect(wallet).toHaveProperty('publicKey');
    })

    describe('signing data', () => {
        const data = 'foobar';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);

        });
        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    describe('Create Transaction()', () => {
        describe('and the amount exceed balance', () => {
            it('throws and error', () => {
                expect(() => wallet.createTransaction({recepient: 'foo-recepient', amount: 999999})).toThrow('Amount exceed balance');
            });
        });

        describe('and the amount is valid', () => {
            let  transaction, amount, recepient;
            
            beforeEach( () => {
                amount = 50;
                recepient = 'foo-recepient';
                transaction = wallet.createTransaction({amount, recepient});
            });

            it('create an instance of `Transaction` object', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount of the recepient', () => {
                expect(transaction.outputMap[recepient]).toEqual(amount);
            });
        });
    });
});