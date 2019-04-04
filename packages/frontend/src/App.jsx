import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import Login from './views/Login';
import Home from './views/Home';
import ChairMeeting from './views/ChairMeeting';
import './App.css';
import MemberMeeting from './views/MemberMeeting';

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
    <Route
      path="/chairMeeting"
      render={props =>
        authToken ? <ChairMeeting config={config} /> : <Redirect to="/login" />
      }
    />
    <Route
      path="/memberMeeting"
      render={props =>
        authToken ? <MemberMeeting config={config} /> : <Redirect to="/login" />
      }
    />
  </Router>
);

export default App;
