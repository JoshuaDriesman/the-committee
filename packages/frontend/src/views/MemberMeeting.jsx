import React from 'react';

import Header from '../components/Header';

import { withRouter } from 'react-router-dom';
import styled from '@emotion/styled';

import { buildRequest } from '../utils';
import CurrentMotion from '../components/CurrentMotion';
import Section from '../components/Section';
import MotionList from '../components/MotionList';
import VotingSection from '../components/VotingSection';

const StyledMemberMeetingDiv = styled.div`
  display: flex;
  flex-direction: row;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0.5;
`;

const StyledLeftSection = styled(Section)`
  flex: 0.5;
`;

class MemberMeeting extends React.Component {
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
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  handleLeave = async () => {
    const req = buildRequest(
      this.props.config.apiRoot +
        `/meeting/${this.state.meeting._id}/participant/leave`,
      'PATCH',
      undefined,
      sessionStorage.getItem('auth')
    );

    const res = await fetch(req);

    if (res.status === 200) {
      sessionStorage.removeItem('meetingId');
      this.props.history.push('/home');
    } else {
      console.error(`Leaving failed with code ${res.status}`);
    }
  };

  render() {
    if (this.state.meeting) {
      const pendingMotionsLength = this.state.meeting.pendingMotions.length;
      return (
        <div>
          <Header
            centerMessage={this.state.meeting.name}
            buttonAction={this.handleLeave}
            buttonText="Leave"
          />
          <StyledMemberMeetingDiv>
            <Column>
              <StyledLeftSection title="Current Motion" indent>
                <CurrentMotion
                  motion={
                    pendingMotionsLength > 0 &&
                    this.state.meeting.pendingMotions[pendingMotionsLength - 1]
                  }
                  config={this.props.config}
                  setError={this.setError}
                  participant={true}
                />
              </StyledLeftSection>
              <StyledLeftSection title="Pending Motions">
                <MotionList
                  motions={this.state.meeting.pendingMotions.slice(
                    0,
                    pendingMotionsLength - 1
                  )}
                  config={this.props.config}
                />
              </StyledLeftSection>
            </Column>
            <Column>
              <Section title="">
                <VotingSection
                  votingRecord={this.state.meeting.activeVotingRecord}
                  motionName={
                    pendingMotionsLength > 0 &&
                    this.state.meeting.pendingMotions[pendingMotionsLength - 1]
                      .userFriendlyName
                  }
                  meetingId={this.state.meeting._id}
                  config={this.props.config}
                />
              </Section>
            </Column>
          </StyledMemberMeetingDiv>
        </div>
      );
    } else {
      return <h1>Meeting loading, please standby</h1>;
    }
  }
}

export default withRouter(MemberMeeting);
