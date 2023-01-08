const Block = require('./block');
const Blockchain = require('.');
const shallowEqual = require('../shallowEqual');
const cryptoHash = require('../util/crypto-hash');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

describe('Blockchain', () => {
    let blockchain, newBlockchain, originalChain, newChain, errorMock;
    beforeEach( () =>{
        blockchain = new Blockchain();
        newBlockchain =  new Blockchain();
        errorMock = jest.fn();

        originalChain = blockchain.chain;
        newChain = newBlockchain.chain;
        global.console.error = errorMock;
    });
    it('contains Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('add a new block to the blockchain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({data: newData});
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain', () => {
        describe('when the chain does not start with genesis chain', () => {
            it('returns false',() => {
                blockchain.chain[0] = {data: 'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with genesis block and has multiple blocks', () => {
            beforeEach( () => {
                blockchain.addBlock({data: 'ala'});
                blockchain.addBlock({data: 'ma'});
                blockchain.addBlock({data: 'kota'});
            });
            describe('and has invalid lastHash', () => {
                
                it('returns false', () => {
                    blockchain.chain[blockchain.chain.length-1] = {lastHash: 'fake-lastHash'};
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and contains block with invalid data', () => {

                it('return false', () => {
                    blockchain.chain[blockchain.chain.length-1] = {data: 'fake-data'};
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

                });
            });

            describe('and the chain contains a block with jumped difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const lastHash = lastBlock.hash;
                    const difficultyLevel = lastBlock.difficultyLevel-3;

                    const hash = cryptoHash(timestamp, lastHash,difficultyLevel, nonce, data);

                    const badBlock = new Block({
                        timestamp, lastHash, hash, nonce, difficultyLevel, data
                    });

                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and is valid blockchain', () => {
                it('returns true', () => {
                    //console.log(blockchain.chain);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });
    
    describe('Replace chain', () => {
        let logMock;

        beforeEach(() => {
           
            logMock = jest.fn();
            global.console.log = logMock;
        });

        describe('The new chain is not longer then the original chain', () => {
            beforeEach(() => {
                newChain[0] = {data: 'fake-data'};
                blockchain.replaceChain(newChain)
            })
            it("does not replace the origianl chain", () => {
                expect(blockchain.chain).toEqual(originalChain);
            })

            // it("logs an error", () => {
            //     expect(errorMock).toHaveBeenCalled();
            // })
        });
        describe('The new chain is longer then the origina chain', () => {
            beforeEach(() =>{
                newBlockchain.addBlock({data: 'ala'});
                newBlockchain.addBlock({data: 'ma'});
                newBlockchain.addBlock({data: 'kota'});
            })
            describe('The new chain is invalid', () =>{
                beforeEach(() => {
                    newChain[1] = {data: 'fake-data'};
                    blockchain.replaceChain(newChain)
                })
                it('dos not replace the original chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                })
                // it("logs an error", () => {
                //     expect(errorMock).toHaveBeenCalled();
                // })
            });
            describe('The new chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain);
                })
                it('replaces the original chain', () => {
                    expect(blockchain.chain).toEqual(newChain);
                })
                // it('logs about the chain replacment', () => {
                //     expect(logMock).toHaveBeenCalled();
                // })
            })
        });
        describe('and the validate transactions flag is true', () => {
            it('calls validTransactionData()', () => {
                const validTransactionDataMock = jest.fn();

                blockchain.validTransactionData = validTransactionDataMock;

                blockchain.addBlock({data: 'foo'});
                blockchain.validTransactionData(newBlockchain.chain,true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            })
        })
    });

    describe('validTransactionData()', () => {
        let tranaction, rewardTransaction, wallet

        beforeEach(() => {
            wallet = new Wallet();
            tranaction = wallet.createTransaction({recepient: 'foo-address', amount: 65});
            rewardTransaction = Transaction.rewardTransaction({minerWallet: wallet});
        });

        describe('and the transaction is valid', () => {
            it('returns true', () => {
                newBlockchain.addBlock({data: [tranaction,rewardTransaction]});

                expect(blockchain.validTransactionData({chain: newBlockchain.chain})).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();

            });
        });

        describe('and the transaction data has multiple rewards', () => {
            it('returns false and logs an error', () => {
                newBlockchain.addBlock({data: [tranaction,rewardTransaction, rewardTransaction]});
                expect(blockchain.validTransactionData({chain: newBlockchain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has at least 1 malformed outputMap', () => {
            describe('and the transaction is not reward transaction', () => {
                it('returns false', () => {
                    tranaction.outputMap[wallet.publicKey] = 999999;

                    newBlockchain.addBlock({data: [tranaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain: newBlockchain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();

                });
            });

            describe('and the transaction is reward transaction', () => {
                it('returns false', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;

                    newBlockchain.addBlock({data: [tranaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain: newBlockchain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();

                });
            });
        });

        describe('and the transaction data has at least 1 malformed input', () => {
            it('returns false and logs an error', () => {
                wallet.balance = 9000;
                const evilOutputMap = {
                    [wallet.publicKey]: 8900,
                    fooRecipient: 100
                };

                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                };
                newBlockchain.addBlock({data: [evilTransaction, rewardTransaction]});
                expect(blockchain.validTransactionData({chain: newBlockchain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and block contains multiple identical transactions', () => {
            it('returns false and logs an error', () => {
                newBlockchain.addBlock({data: [tranaction,tranaction,tranaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain: newBlockchain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
            });
        });
    })
});