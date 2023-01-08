const Wallet = require ('./index');
const {verifySignature} = require('../util');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');

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

        describe('and the chaing is passed', () => {
            it('calls  `Wallet.calculateBalance`', () => {
                const calculateBalanceMock = jest.fn();

                originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recepient: 'foo',
                    amount: 10, 
                    chain: new Blockchain().chain
                })

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            })
        })
    });

    describe('calculateBalance()', () =>{
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and no output for the wallet', () => {
            it('returns the `STARTING BALANCE`', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })).toEqual(STARTING_BALANCE);
            })
        });
        
        describe('and there is an output for the wallet', () => {
            let transactionOne, transactionTwo;
            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recepient: wallet.publicKey,
                    amount: 50
                });

                transactionTwo = new Wallet().createTransaction({
                    recepient: wallet.publicKey,
                    amount: 60
                });

                blockchain.addBlock({ data: [transactionOne,transactionTwo]});
            });

            it('adds the sum of all outputs to the wallet balance', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey]);
            });

            describe("and the wallet has made a transaction", () => {
                let recentTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recepient: 'foo-address',
                        amount: 30
                    });

                    blockchain.addBlock({data: [recentTransaction]});

                });

                it('returns the output of the recent transaction', () => {
                    expect(Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })).toEqual(recentTransaction.outputMap[wallet.publicKey])
                });

                describe('and there are output next to and after the recent transactions', () => {
                    let sameBlockTransactions, nextBlockTransaction;

                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recip: 'foo-address',
                            amount: 60
                        });

                        sameBlockTransactions = Transaction.rewardTransaction({minerWallet: wallet});

                        blockchain.addBlock({data: [recentTransaction, sameBlockTransactions]});

                        nextBlockTransaction = new Wallet().createTransaction({
                            recepient: wallet.publicKey,
                            amount: 75
                        });

                        blockchain.addBlock({data: [nextBlockTransaction]});
                    });
                    it('includes the output amount in return balance', () => {

                        expect(
                            Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                            })
                        ).toEqual(
                            recentTransaction.outputMap[wallet.publicKey] +
                            sameBlockTransactions.outputMap[wallet.publicKey] +
                            nextBlockTransaction.outputMap[wallet.publicKey]
                        );
                    })
                })
            })

        });
    })
});