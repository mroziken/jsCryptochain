const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub.js');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMinner = require('./app/transaction-minner');
const path = require('path')


const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain, transactionPool});
const transactionMiner = new TransactionMinner({blockchain, transactionPool, wallet, pubsub});

const DEFAULT_PORT=3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'client/dist')));

app.post('/api/mine', (req,res) => {
    console.log("In api/mine");
    //console.log("Request: ", req);
    const {data} = req.body;
    blockchain.addBlock({data});

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req,res) => {
    //console.log("In api/transact");
    console.log("Request: ", req.body);
    const {recipient, amount} = req.body;

    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});
    
    try{
        if(transaction){
            transaction.update({senderWallet: wallet, recipient, amount});
        } else {
            transaction = wallet.createTransaction({recipient,amount, chain: blockchain.chain});
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
    //console.log("Request: ", req);
    console.log('transactionPool.transactionMap',transactionPool.transactionMap);
    res.json(transactionPool.transactionMap);
});

app.get('/api/blocks', (req, res) => {
    console.log("In /api/blocks");
    //console.log("Request: ", req);
    res.json(blockchain.chain);
});

app.get('/api/mine-transactions', (req, res) => {
    console.log("In /api/mine-transactions");
    //console.log("Request: ", req);
    transactionMiner.mineTransaction();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req,res) => {
    const address = wallet.publicKey;
    res.json({
        address,
        balance: Wallet.calculateBalance({chain: blockchain.chain, address})
    })
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
})

const synchChains = () => {
    console.log('In synchChains');
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response,body) => {
        if(!error & response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            //console.log('call replaceChain: ', rootChain)
            blockchain.replaceChain(rootChain);
        }
    })
}

const synchTransactionPool = () => {
    console.log('In synchTransactionPool');
    request({url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`}, (error, response,body) => {
        if(!error & response.statusCode === 200) {
            const transactionMap = JSON.parse(body);
            //console.log('sets transaction pool map with:  ', transactionMap);
            transactionPool.replaceTransactionMap(transactionMap);
        }
    })
}

const  walletFoo = new Wallet();
const walletBar = new Wallet();

const generateWalletTransaction = ({wallet, recipient, amount}) =>{
    const transaction = wallet.createTransaction({recipient,amount,chain: blockchain.chain});

    transactionPool.setTransaction(transaction);
};

const walletAction = () => generateWalletTransaction({
    wallet, recipient: walletFoo.publicKey, amount: 5
});

const walletFooAction = () => generateWalletTransaction({
    wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
});

const walletBarAction = () => generateWalletTransaction({
    wallet: walletBar, recipient: wallet.publicKey, amount: 15
});


for (let i=0; i<10; i++ ){
    if (i%3 === 0){
        walletAction();
        walletFooAction();
    }
    else if(i%3 === 1){
        walletAction();
        walletBarAction();
    }
    else{
        walletFooAction();
        walletBarAction();
    }
    transactionMiner.mineTransaction();
}

let  PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
    console.warn(`listening at local host:${PORT}`)
    if (PORT !== DEFAULT_PORT){
        synchChains();
        synchTransactionPool();
    }
})