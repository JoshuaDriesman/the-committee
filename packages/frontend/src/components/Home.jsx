import React, { useEffect, useState } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';

import styled from '@emotion/styled';
import { withRouter } from 'react-router-dom';

import { buildRequest } from '../utils';

const HomeHeader = props => {
  const StyledAppBar = styled(AppBar)`
    display: flex;
    flex-direction: row !important;
    background-color: grey !important;
    padding-bottom: 10px;
    padding-top: 10px;
    position: inherit !important;
  `;
  const StyledTitle = styled.div`
    margin-left: 10px;
    font-size: 36px;
    flex: 0.33;
  `;
  const StyledWelcome = styled.div`
    font-size: 36px;
    text-align: center;
    flex: 0.33;
  `;
  const StyledButtonWrapper = styled.div`
    text-align: right;
    margin-top: 5px;
    flex: 0.33;
  `;
  const StyledButton = styled(Button)`
    color: white !important;
  `;

  const onLogout = () => {
    sessionStorage.clear();
    props.routeHistory.replace('/login');
  };

  return (
    <StyledAppBar>
      <StyledTitle>The Committee</StyledTitle>
      <StyledWelcome>
        Welcome {props.user && props.user.firstName}
      </StyledWelcome>
      <StyledButtonWrapper>
        <StyledButton onClick={onLogout}>Logout</StyledButton>
      </StyledButtonWrapper>
    </StyledAppBar>
  );
};

const Home = props => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const req = buildRequest(
        props.config.apiRoot + '/user',
        'GET',
        undefined,
        sessionStorage.getItem('auth')
      );
      const res = await fetch(req);

      if (res.status === 200) {
        setUser(await res.json());
      }
    };
    if (!user) {
      fetchData();
    }
  });

  const StyledPage = styled.div`
    display: flex;
    flex-direction: column;
  `;

  return (
    <StyledPage>
      <HomeHeader user={user} routeHistory={props.history} />
      {user && user.email === 'suchirarsharma@gmail.com' && (
        <Button>Start Meeting</Button>
      )}
    </StyledPage>
  );
};

export default withRouter(Home);
