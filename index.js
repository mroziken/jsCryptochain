const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PORT=3000;

const app = express();
const blockchain = new Blockchain();

app.use(bodyParser.json());

app.post('/api/mine', (req,res) => {
    const {data} = req.body;
    blockchain.addBlock({data});

    res.redirect('/api/blocks');
})

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.listen(PORT, () => {
    console.log(`listening at local host:${PORT}`)
})