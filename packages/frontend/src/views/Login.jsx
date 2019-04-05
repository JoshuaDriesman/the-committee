import React, { useState } from 'react';

import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';

import styled from '@emotion/styled';
import { withRouter } from 'react-router-dom';

import ErrorSnackbar from '../components/ErrorSnackbar';
import { buildRequest } from '../utils';

const StyledPaper = styled(Paper)`
  width: 50%;
  margin-top 5%;
  margin-left: 25%;
  padding-bottom: 25px;
  padding-left: 10px;
`;

const StyledLoginForm = styled.div`
  margin-left: 20%;
`;

const StyledInput = styled(Input)`
  margin-right: 10px;
`;

const Login = props => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = event => setEmail(event.target.value);
  const handlePasswordChange = event => setPassword(event.target.value);

  const handleLogin = async () => {
    const data = {
      email,
      password
    };

    const request = buildRequest(
      props.config.apiRoot + '/user/login',
      'POST',
      data
    );

    const result = await fetch(request);

    switch (result.status) {
      case 200:
        sessionStorage.setItem('auth', await result.text());
        props.history.push('/home');
        break;
      case 400:
        setError('Email and password are both required.');
        break;
      case 404:
        setError('User with given email does not exist.');
        break;
      case 403:
        setError('Incorrect password');
        break;
      default:
        console.error(result.status);
    }
  };

  return (
    <StyledPaper>
      <h1>The Committee</h1>
      <StyledLoginForm>
        <StyledInput
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
        />
        <StyledInput
          placeholder="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
        <Button onClick={handleLogin}>Login</Button>
        <ErrorSnackbar error={error} setError={setError} />
      </StyledLoginForm>
    </StyledPaper>
  );
};

export default withRouter(Login);
