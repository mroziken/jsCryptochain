const Block = require('./block.js');
const cryptoHash = require('../util/crypto-hash');
const shallowEqual = require('../shallowEqual.js');

class Blockchain{
    constructor(){
        this.chain = [];
        this.chain.push(Block.genesis());
    }

    addBlock({data}){
        const lastBlock = Blockchain.lastBlock(this.chain);
        const newBlock = Block.mineBlock({lastBlock,data})
        this.chain.push(newBlock);
    };

    static firstBlock(chain){
        return chain[0];
    };

    static lastBlock(chain){
        return chain[chain.length-1];
    }

    static previousBlock(chain){
        return chain[chain.length-2];
    }

    static isValidChain(chain){

        //console.log(chain);
        // test if first block is genesis block
        if(! shallowEqual(Blockchain.firstBlock(chain),Block.genesis())){
            //console.warn("Incorrect genesis block");
            return false;
        }
        //test if lastHash of lastBlock equalst to hash of previous block
        // if (Blockchain.lastBlock(chain).lastHash != Blockchain.previousBlock(chain).hash){
        //     console.log("incorrect lastHash block");
        //     return false;
        // }
        for (let i=1; i<chain.length; i++){
            const {timestamp, lastHash, difficultyLevel, data, hash} = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficultyLevel = chain[i-1].difficultyLevel;
            if(lastHash !== actualLastHash){
                //console.warn("incorrect lastHash block of block: " + i);
                return false;
            }
            if (Math.abs(lastDifficultyLevel-difficultyLevel)>1){
                return false;
            }
        }
        //test if hash is correct
        if (Blockchain.lastBlock(chain).hash !== cryptoHash(
                Blockchain.lastBlock(chain).timestamp,
                Blockchain.lastBlock(chain).data,
                Blockchain.lastBlock(chain).lastHash,
                Blockchain.lastBlock(chain).difficultyLevel,
                Blockchain.lastBlock(chain).nonce
                )){
            //console.warn("incorrect hash block");
            return false;
        }

        return true;
    };

    replaceChain(newChain){
        if(newChain.length <= this.chain.length) {
            return;
        }
        if(! Blockchain.isValidChain(newChain)){
            return;
        }
        this.chain = newChain;
    }
};

module.exports = Blockchain;

