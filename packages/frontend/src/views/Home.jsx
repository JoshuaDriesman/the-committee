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

const MeetingList = props => {
  const meetingRows = [];

  if (props.meetings) {
    props.meetings.forEach(meeting => {
      meetingRows.push(<li key={meeting._id}>{meeting.name}</li>);
    });
  }

  return <ul>{meetingRows}</ul>;
};

const Home = props => {
  const [user, setUser] = useState(undefined);
  const [meetings, setMeetings] = useState(undefined);

  useEffect(() => {
    const fetchCurrentUser = async () => {
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
      fetchCurrentUser();
    }

    const fetchUserMeetings = async () => {
      const req = buildRequest(
        props.config.apiRoot + '/meetingByMember',
        'GET',
        undefined,
        sessionStorage.getItem('auth')
      );
      const res = await fetch(req);

      if (res.status === 200) {
        setMeetings(await res.json());
      }
    };
    if (!meetings) {
      fetchUserMeetings();
    }
  });

  const StyledPage = styled.div`
    display: flex;
    flex-direction: column;
  `;

  const handleStartMeeting = async () => {
    const req = buildRequest(
      props.config.apiRoot + '/meeting/start',
      'POST',
      {
        name: 'Senate Meeting',
        rosterId: '5ca11bd74ec0422d879f1568',
        motionSetId: '5ca117f01e654d2c6c0dad21'
      },
      sessionStorage.getItem('auth')
    );

    const res = await fetch(req);

    if (res.status === 200) {
      console.log('success');
      const meetingData = await res.json();
      sessionStorage.setItem('meetingId', meetingData._id);
      props.history.push('/chairMeeting');
      props.history.goForward();
    }
  };

  return (
    <StyledPage>
      <HomeHeader user={user} routeHistory={props.history} />
      {user && user.email === 'suchirarsharma@gmail.com' ? (
        <Button onClick={handleStartMeeting}>Start Meeting</Button>
      ) : (
        <MeetingList meetings={meetings} />
      )}
    </StyledPage>
  );
};

export default withRouter(Home);
