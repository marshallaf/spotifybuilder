import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import HomePage from './containers/HomePage';
import DashboardPage from './containers/DashboardPage';
import LoginPage from './containers/LoginPage';
import './main.scss';

// the root react-router that handles all client side (non-api/auth) routing
const MainRouter = () => (
  <Router>
    <div>
      <Route exact path='/' component={HomePage} />
      <Route path='/dashboard' component={DashboardPage} />
      <Route path='/login' component={LoginPage} />
    </div>
  </Router>
);

ReactDOM.render((<MainRouter />), document.getElementById('app'));
