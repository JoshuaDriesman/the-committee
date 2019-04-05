import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import Login from './views/Login';
import Home from './views/Home';
import ChairMeeting from './views/ChairMeeting';
import './App.css';
import MemberMeeting from './views/MemberMeeting';

const apiRoot = 'http://localhost:8080/api';
const mode = 'DEV';

const config = {
  apiRoot,
  mode
};

const getAuthToken = () => {
  return sessionStorage.getItem('auth');
};

const App = () => (
  <Router>
    <Route
      path="/login"
      render={props =>
        getAuthToken() ? (
          <Redirect to="/home" />
        ) : (
          <Login {...props} config={config} />
        )
      }
    />
    <Route
      path="/home"
      render={props =>
        getAuthToken() ? <Home config={config} /> : <Redirect to="/login" />
      }
    />
    <Route
      path="/chairMeeting"
      render={props =>
        getAuthToken() ? (
          <ChairMeeting config={config} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
    <Route
      path="/memberMeeting"
      render={props =>
        getAuthToken() ? (
          <MemberMeeting config={config} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  </Router>
);

export default App;
