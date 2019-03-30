import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';

const Login = () => <h1>Login</h1>;

const App = () => (
  <Router>
    <Route path="/login" component={Login} />
  </Router>
);

export default App;
