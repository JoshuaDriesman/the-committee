import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import Login from './components/Login';
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
      render={() => (authToken ? <p>Welcome</p> : <Redirect to="/login" />)}
    />
  </Router>
);

export default App;
