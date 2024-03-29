const PubNub = require('pubnub');

const { parse } = require('uuid');
const Block = require('../blockchain/block');

const credentials = {
    publishKey: 'pub-c-50912194-5f2a-468c-8103-a0376ae00fcb',
    subscribeKey: 'sub-c-3de79138-f3f4-4e8e-ae51-cb002d081bb7',
    secretKey: 'sec-c-MzBhMjlhOWMtYzA3YS00Y2Q0LTkyMjktNGJkN2I1NWYxMThj'
}

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
};

class PubSub{
    constructor({blockchain,transactionPool}){
        console.log('In constructor of PubSub');
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.pubnub = new PubNub(credentials);
        this.pubnub.subscribe({channels: Object.values(CHANNELS)});
        this.pubnub.addListener(this.listener());
    }

    listener(){
        return {
            message: messageObject => {
                const {channel, message} = messageObject;

                console.log(`Message received. Channel: ${channel}. Message: ${message}`);
            }
        }
    }

    publish({channel, message}){
        this.pubnub.publish({channel, message});
    }

    handleMessage(channel, message){
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
        const parsedMessage = JSON.parse(message);

        switch(channel){
            case CHANNELS.BLOCKCHAIN:
                console.log('Before conversion parsedMessage: ', parsedMessage);
                for(let i=0; i<parsedMessage.length; i++){
                    parsedMessage[i] = new Block(parsedMessage[i]);
                }
                console.log('After conversion parsedMessage: ', parsedMessage);
                this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    });
                });
                break;
            case CHANNELS.TRANSACTION:
                console.log(`TRANSACTION channel: ${parsedMessage}`)
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
        }
    }

    subscribeToChannels(){
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }


    broadcastChain(){
        console.log("In broadcastChain: ", this.blockchain.chain);
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message:JSON.stringify(this.blockchain.chain)
        })
    }

    broadcastTransaction(transaction){
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message:JSON.stringify(transaction)
        })
    }
}

//const testPubSub = new PubSub();
//testPubSub.publish({channel: CHANNELS.TEST, message: 'hellow world'});

module.exports = PubSub;