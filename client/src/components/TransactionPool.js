import React, {Component} from "react";
import Transaction from "./Transaction";
import { Link } from "react-router-dom";

class TransactionPool extends Component {
    state = {TransactionPoolMap: {}};

    fetchTransactionPoolMap = () => {
        console.log('In fetchTransactionPoolMa');
        fetch('http://localhost:3000/api/transaction-pool-map')
        .then(response => response.json())
        .then(json => this.setState({TransactionPoolMap: json}));
    }

    componentDidMount(){
        console.log('before fetchTransactionPoolMap');
        this.fetchTransactionPoolMap();
        console.log('after fetchTransactionPoolMap');
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
            </div>
        )
    }
}

export default TransactionPool;