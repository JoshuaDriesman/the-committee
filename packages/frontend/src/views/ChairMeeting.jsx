import React from 'react';

import { withRouter } from 'react-router-dom';

import styled from '@emotion/styled';

import { buildRequest } from '../utils';
import Header from '../components/Header';
import MotionList from '../components/MotionList';
import CurrentMotion from '../components/CurrentMotion';
import Section from '../components/Section';
import ErrorSnackbar from '../components/ErrorSnackbar';
import ParticipantList from '../components/ParticipantList';
import MakeMotion from '../components/MakeMotion';

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledTopSection = styled(Section)`
  flex: 0.3;
`;

const StyledParticipantSection = styled(Section)`
  flex: 0.4;
`;

const StyledPendingMotions = styled(Section)`
  flex: 0.44;
`;

const StyledMeetingHistory = styled(Section)`
  flex: 0.56;
`;
class ChairMeeting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meeting: null,
      intervalId: null,
      motionTypes: null,
      error: ''
    };
  }

  componentDidMount() {
    if (!this.state.meeting) {
      const getMeetingData = async () => {
        const meetingId = sessionStorage.getItem('meetingId');
        if (!meetingId) {
          console.error('No meeting ID in storage!');
        }
        const request = buildRequest(
          this.props.config.apiRoot + `/meeting/${meetingId}`,
          'GET',
          undefined,
          sessionStorage.getItem('auth')
        );

        const response = await fetch(request);

        if (response.status === 200) {
          const meetingData = await response.json();
          if (
            JSON.stringify(this.state.meeting) !== JSON.stringify(meetingData)
          ) {
            this.setState({ meeting: meetingData });
          }
        } else {
          console.error(`Meeting request returned with ${response.status}`);
        }
      };

      getMeetingData();

      this.setState({ intervalId: setInterval(getMeetingData, 1000) });
    }

    if (!this.state.motionTypes) {
      const getMotionTypes = async () => {
        const req = buildRequest(
          this.props.config.apiRoot + '/motionType',
          'GET',
          undefined,
          sessionStorage.getItem('auth')
        );

        const res = await fetch(req);

        if (res.status !== 200) {
          console.error(`Could not get motion types, status is ${res.status}`);
        } else {
          this.setState({ motionTypes: await res.json() });
        }
      };

      getMotionTypes();
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  setError = error => {
    this.setState({ error });
  };

  handleAdjourn = async () => {
    const req = buildRequest(
      this.props.config.apiRoot +
        `/meeting/${this.state.meeting._id}/chair/adjourn`,
      'PATCH',
      undefined,
      sessionStorage.getItem('auth')
    );

    const res = await fetch(req);

    if (res.status === 200) {
      sessionStorage.removeItem('meetingId');
      this.props.history.push('/home');
    } else {
      console.error(`Adjourn failed with code ${res.status}`);
    }
  };

  render() {
    if (this.state.meeting && this.state.motionTypes) {
      const members = this.state.meeting.attendanceRecords
        .filter(ar => ar.status === 'present')
        .map(ar => ar.member);
      const pendingMotionsLength = this.state.meeting.pendingMotions.length;
      return (
        <div>
          <Header
            centerMessage={this.state.meeting.name}
            buttonAction={this.handleAdjourn}
            buttonText="Adjourn"
          />
          <div>
            <Row>
              <StyledTopSection title="Current Motion" indent>
                <CurrentMotion
                  motion={
                    pendingMotionsLength > 0 &&
                    this.state.meeting.pendingMotions[pendingMotionsLength - 1]
                  }
                  config={this.props.config}
                  votingRecord={this.state.meeting.activeVotingRecord}
                  setError={this.setError}
                  participant={false}
                />
              </StyledTopSection>
              <StyledTopSection title="Make Motion" indent>
                <MakeMotion
                  motionTypes={this.state.motionTypes}
                  members={members}
                  config={this.props.config}
                  setError={this.setError}
                  currentMotion={
                    pendingMotionsLength > 0 &&
                    this.state.meeting.pendingMotions[pendingMotionsLength - 1]
                  }
                />
              </StyledTopSection>
              <StyledParticipantSection title="Participants">
                <ParticipantList
                  attendanceRecords={this.state.meeting.attendanceRecords}
                />
              </StyledParticipantSection>
            </Row>
            <Row>
              <StyledPendingMotions title="Pending Motions">
                <MotionList
                  motions={this.state.meeting.pendingMotions.slice(
                    0,
                    pendingMotionsLength - 1
                  )}
                  config={this.props.config}
                />
              </StyledPendingMotions>
              <StyledMeetingHistory title="Meeting History">
                <MotionList
                  showStatus
                  motions={this.state.meeting.motionHistory}
                  config={this.props.config}
                />
              </StyledMeetingHistory>
            </Row>
            <ErrorSnackbar error={this.state.error} setError={this.setError} />
          </div>
        </div>
      );
    } else {
      return <h1>Meeting loading, please standby</h1>;
    }
  }
}

export default withRouter(ChairMeeting);
