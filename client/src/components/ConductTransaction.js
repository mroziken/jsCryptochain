import React, {Component} from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

class ConductTransaction extends Component{
    state = {recipient: '', amount: 0};

    updateRecipient = event =>{
        console.log('this.state', this.state);
        this.setState ({recipient: event.target.value})
    }

    updateAmount = event =>{
        console.log('this.state', this.state);
        this.setState ({amount: Number(event.target.value)})
    }

    conductTransaction = () => {
        console.log('conductTransaction this.state', this.state)
        const {recipient, amount} = this.state;

        fetch('http://localhost:3000/api/transact', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({recipient,amount})
        }).then(response => response.json())
        .then(json => {
            alert(json.message || json.type)
        });
    }

    render(){
        return(
            <div className="ConductTransaction">
                <Link to='/'>Home</Link>
                <h3>Conduct Transaction</h3>
                <div>
                    <input name="recipient" value={this.state.recipient} onChange={this.updateRecipient} className="inputField" />
                </div>
                <div>
                    <input name="amount" value={this.state.amount} onChange={this.updateAmount} className="inputField" />
                </div>
                <div>
                <Button
                bsStyle="danger"
                onClick={this.conductTransaction}
                >
                    Submit
                </Button>
                </div>
            </div>
        )
    }
}

export default ConductTransaction;