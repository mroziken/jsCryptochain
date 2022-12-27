const Block = require('./block');
const Blockchain = require('./blockchain');
const shallowEqual = require('./shallowEqual');

describe('Blockchain', () => {
    let blockchain, newBlockchain, originalChain, newChain;
    beforeEach( () =>{
        blockchain = new Blockchain();
        newBlockchain =  new Blockchain();

        originalChain = blockchain.chain;
        newChain = newBlockchain.chain;
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
            describe('and is valid blockchain', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });
    
    describe('Replace chain', () => {
        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
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
        })
    });
});