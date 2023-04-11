import React, {Component} from "react";
import Transaction from "./Transaction";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import history from '../history';

const POOL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
    state = {TransactionPoolMap: {}};

    fetchTransactionPoolMap = () => {
        console.log('In fetchTransactionPoolMa');
        fetch(`${document.location.origin}/api/transaction-pool-map`)
        .then(response => response.json())
        .then(json => this.setState({TransactionPoolMap: json}));
    }

    fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
        .then(response => {
            if(response.status === 200){
                alert('success');
                history.push('/blocks');
            } else {
                alert('The mine-transaction block request did not complete');
            }
        })
    }

    componentDidMount(){
        console.log('before fetchTransactionPoolMap');
        this.fetchTransactionPoolMap();
        console.log('after fetchTransactionPoolMap');
        
        this.fetchPoolMapInterval = setInterval(
            () => this.fetchTransactionPoolMap(),
            POOL_INTERVAL_MS
        );
    }

    componentWillUnmount(){
        clearInterval(this.fetchPoolMapInterval);
    }

    render(){
        return(
            <div className="TransactionPool">
                <div><Link to='/' >Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.TransactionPoolMap).map(transaction => {
                        return(
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction} />
                            </div>
                        )
                    })
                }
                <Button 
                    bsStyle="danger"
                    onClick={this.fetchMineTransactions}
                    >
                    Mine Transactions
                </Button>
            </div>
        )
    }
}

export default TransactionPool;