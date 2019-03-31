import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import Login from './components/Login';
import Home from './components/Home';
import './App.css';

const apiRoot = 'http://localhost:8080';
const mode = 'DEV';

const config = {
  apiRoot,
  mode
};

const authToken = sessionStorage.getItem('auth');

const App = () => (
  <Router>
    <Route
      path="/login"
      render={props => <Login {...props} config={config} />}
    />
    <Route
      path="/home"
      render={props =>
        authToken ? <Home config={config} /> : <Redirect to="/login" />
      }
    />
  </Router>
);

export default App;
