import React, { useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';

import styled from '@emotion/styled';
import { withRouter } from 'react-router-dom';

import { buildRequest } from '../utils';
import Header from '../components/Header';

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

  const onLogout = () => {
    sessionStorage.clear();
    props.history.replace('/login');
  };

  return (
    <StyledPage>
      <Header
        centerMessage={'Welcome ' + (user && user.firstName)}
        buttonAction={onLogout}
        buttonText="Logout"
      />
      {user && user.email === 'suchirarsharma@gmail.com' ? (
        <Button onClick={handleStartMeeting}>Start Meeting</Button>
      ) : (
        <MeetingList meetings={meetings} />
      )}
    </StyledPage>
  );
};

export default withRouter(Home);
