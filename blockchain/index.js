const Block = require('./block.js');
const {cryptoHash} = require('../util');
const shallowEqual = require('../shallowEqual.js');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');
const TransactionPool = require('../wallet/transaction-pool.js');
const { REWARD_INPUT, MINING_REWARD } = require('../config.js');

class Blockchain{
    constructor(){
        //console.log('In consturctor of Blockchain');
        this.chain = [];
        this.chain.push(Block.genesis());
        //console.log(this);
    }

    addBlock({data}){
        //console.log('In addBlock');
        const lastBlock = Blockchain.lastBlock(this.chain);
        const newBlock = Block.mineBlock({lastBlock,data});
        //console.log('Old chain:', this.chain);
        this.chain.push(newBlock);
        //console.log('New chain:', this.chain);
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
        //console.log('In isValidChain');
        // test if first block is genesis block
        //if(! shallowEqual(Blockchain.firstBlock(chain),Block.genesis()))
        if(Blockchain.firstBlock(chain) === Block.genesis()){
            console.warn("Incorrect genesis block");
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
                //console.warn('Incorrect difficulty level');
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

    replaceChain(newChain, validateTransaction, onSuccess){
        console.log('In replaceChain');
        //console.log('current chain:', this.chain, 'proposed chain:', newChain);
        if(newChain.length <= this.chain.length) {
            console.error('too short chain', newChain.length, this.chain.length);
            return;
        }
        if(! Blockchain.isValidChain(newChain)){
            console.error('Invalid chain');
            return;
        }

        if(validateTransaction && ! this.validTransactionData({chai})){
            console.error('Invalid chain');
            return;
        }

        if(onSuccess) onSuccess();
        console.log('Chain replaced');
        this.chain = newChain;
    }

    validTransactionData({chain}){
        //console.warn('In validTransactionData', chain);

        for (let i=1; i<chain.length; i++){
            const block =chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;
            for(let tranaction of block.data){
                if (tranaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount += 1;

                    if(rewardTransactionCount >1){
                        console.error('Miner reward exceed limit');
                        return false;
                    }

                    if(Object.values(tranaction.outputMap)[0] !== MINING_REWARD){
                        console.error('Miner reward amount is invalid', tranaction);
                        return false;
                    }
                } else{
                    //console.warn('transaction: ', tranaction)
                    if(! Transaction.validTransaction(tranaction)){
                        console.error('Invalid transaction', tranaction);
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: tranaction.input.address
                    });

                    if(tranaction.input.amount !== trueBalance){
                        console.error('Invalid input amount');
                        return false;
                    }

                    if (transactionSet.has(tranaction)){
                        console.error('Duplicated transaction');
                        return false;
                    }
                    else{
                        transactionSet.add(tranaction);
                    }
                }
            }
        }

        return true;
    }
};

module.exports = Blockchain;

