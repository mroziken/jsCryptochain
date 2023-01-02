const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub.js');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');


const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain, transactionPool});

const DEFAULT_PORT=3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

app.use(bodyParser.json());

app.post('/api/mine', (req,res) => {
    console.log("In api/mine");
    console.log("Request: ", req);
    const {data} = req.body;
    blockchain.addBlock({data});

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req,res) => {
    console.log("In api/transact");
    console.log("Request: ", req);
    const {recepient, amount} = req.body;

    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});
    
    try{
        if(transaction){
            transaction.update({senderWallet: wallet, recepient, amount});
        } else {
            transaction = wallet.createTransaction({recepient,amount});
        }
    } catch(error){
        return res.status(400).json({
            "type": "error",
            "message": error.message
        });
    }
    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);   

    res.json(({"type": "success", transaction}));
});

app.get('/api/transaction-pool-map', (req,res) => {
    console.log("In api/transaction-pool-map");
    console.log("Request: ", req);
    res.json(transactionPool.transactionMap);
});

app.get('/api/blocks', (req, res) => {
    console.log("In api/blocks");
    console.log("Request: ", req);
    res.json(blockchain.chain);
});

const synchChains = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response,body) => {
        if(!error & response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('replace chain with a such chain ', rootChain)
            blockchain.replaceChain(rootChain);
        }
    })
}

const synchTransactionPool = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`}, (error, response,body) => {
        if(!error & response.statusCode === 200) {
            const transactionMap = JSON.parse(body);
            console.log('sets transaction pool map with:  ', transactionMap);
            transactionPool.replaceTransactionMap(transactionMap);
        }
    })
}

let  PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
    console.log(`listening at local host:${PORT}`)
    if (PORT !== DEFAULT_PORT){
        synchChains();
        synchTransactionPool();
    }
})