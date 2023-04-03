import React from "react";
//import { render } from "react-dom";
import { createRoot } from 'react-dom/client';
import {Router, Switch, Route} from 'react-router-dom';
import history from "./history";
import App from "./components/App";
import Blocks from "./components/Blocks";
import ConductTransaction from "./components/ConductTransaction";
import './index.css';

const root = createRoot(document.getElementById('root'))
root.render(
//<App />
<Router history={history}>
    <Switch>
        <Route exact path='/' component={App} />
        <Route path='/blocks' component={Blocks} />
        <Route path='/conduct-transaction' component={ConductTransaction} />
    </Switch>
</Router>
)

/*render(
    <App/>,
    document.getElementById('root')
);*/