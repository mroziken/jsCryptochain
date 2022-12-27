const { GENESIS_DATA, MINE_RATE } = require('./config');
const cryptoHash = require('./crypto-hash');
const hexToBinary = require('hex-to-binary');

class Block{
    constructor({timestamp,lastHash,hash,data,difficultyLevel,nonce}){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.data = data;
        this.hash = hash;
        this.difficultyLevel = difficultyLevel;
        this.nonce = nonce;
    }

    static genesis(){
        return new this(GENESIS_DATA);
    }

    static adjustDifficultyLevel({originalBlock, timestamp}){
        const {difficultyLevel} = originalBlock;
        if(difficultyLevel < 1) return 1;
        const difference  = timestamp - originalBlock.timestamp;
        if (difference > MINE_RATE) {
            return difficultyLevel - 1;
        }
        else{
            return difficultyLevel + 1;
        }
    }

    static mineBlock(blockElements){
        let timestamp, hash;
        const lastBlock = blockElements.lastBlock;
        const data = blockElements.data;
        let { difficultyLevel} = lastBlock;
        //const timestamp = Date.now();
        const lastHash = lastBlock.hash;
       
        let nonce =  0;
        
        do{
            nonce++;
            timestamp = Date.now();
            difficultyLevel = Block.adjustDifficultyLevel({originalBlock: lastBlock,timestamp});
            hash = cryptoHash(timestamp,data,lastHash, difficultyLevel, nonce);
        } while (hexToBinary(hash).substring(0,difficultyLevel) !== '0'.repeat(difficultyLevel))

        return new this(
            {
                timestamp,
                lastHash,
                data,
                difficultyLevel,
                nonce,
                hash
            }
        )
    }
};

module.exports = Block;