const Block = require('./block.js');
const cryptoHash = require('../util/crypto-hash');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const hexToBinary = require('hex-to-binary');

describe("Block", () => {
    const timestamp = Date.now();
    const lastHash = 'foo-LastHash';
    const hash = 'foo-hash';
    const data = [
        'blockchain',
        'data'
    ];
    const difficultyLevel = 1;
    const nonce = 1;
    const block = new Block({timestamp,lastHash,hash,data,difficultyLevel,nonce});
    it('has a timestamp data property', () => {
        expect(block.timestamp).toEqual(timestamp);
    })
    it('has a lastHash data property', () => {
        expect(block.lastHash).toEqual(lastHash);
    })
    it('has a hash data property', () => {
        expect(block.hash).toEqual(hash);
    })
    it('has a data data property', () => {
        expect(block.data).toEqual(data);
    });
    it('has a difficultyLenvel property', () => {
        expect(block.difficultyLevel).toEqual(difficultyLevel);
    });
    it('has a nonce property', () => {
        expect(block.nonce).toEqual(nonce
            
            );
    });

    describe("Genesis data", () => {
        const genesisBlock = Block.genesis();
        it("returs a Block instance", () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });
        it("returns the genesis data", () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe("Mined block", () => {
        const lastBlock = Block.genesis();
        const data = "Mined block data";
        const minedBlock = Block.mineBlock({lastBlock,data});
        
        it("returns a Block instance", () => {
            expect(minedBlock instanceof Block).toEqual(true);
        });
        it("Has lastHash to equal last block hash value", () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });
        it("has correct data value", () => {
            expect(minedBlock.data).toEqual(data);
        });
        it("has declared timestamp", () => {
            expect(minedBlock.timestamp).not.toEqual()
        });

        it('craetes a SHA-256 hash based on the proper inputs', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp,lastBlock.hash,data,minedBlock.difficultyLevel,minedBlock.nonce));
        });
        it('set a hash that matches the difficulti criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficultyLevel)).toEqual('0'.repeat(minedBlock.difficultyLevel));
        });
        it('adjust the difficulty level', () => {
            const possibleResults = [lastBlock.difficultyLevel+1, lastBlock.difficultyLevel-1];
            expect(possibleResults.includes(minedBlock.difficultyLevel)).toBe(true);
        })
    });

    describe('adjustDifficultyLevel()', () => {
        it('raises the difficulty level for a quick mined block', () => {
            expect(Block.adjustDifficultyLevel({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficultyLevel+1);
        });
        it('lowers the difficulty level for a slowly mined block', () => {
            expect(Block.adjustDifficultyLevel({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficultyLevel-1);
        });    
        it('has a lower limit of difficulty level = 1', () => {
            block.difficultyLevel = -1;
            expect(Block.adjustDifficultyLevel({originalBlock: block})).toEqual(1);
        })    
    })

});
