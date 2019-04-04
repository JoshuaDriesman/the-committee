import React from 'react';

import { withRouter } from 'react-router-dom';

import styled from '@emotion/styled';

import { buildRequest } from '../utils';
import Header from '../components/Header';
import MotionList from '../components/MotionList';

const Row = styled.div`
  display: flex;
`;

class ChairMeeting extends React.Component {
  constructor(props) {
    super(props);
    this.state = { meeting: null, intervalId: null };
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
          this.setState({ meeting: meetingData });
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
      this.props.history.goForward();
    } else {
      console.error(`Adjourn failed with code ${res.status}`);
    }
  };

  render() {
    if (this.state.meeting) {
      return (
        <div>
          <Header
            centerMessage={this.state.meeting.name}
            buttonAction={this.handleAdjourn}
            buttonText="Adjourn"
          />
          <div>
            <Row>
              <div>Current Motion</div>
              <div>Make Motion</div>
              <div>Roster</div>
            </Row>
            <Row>
              <MotionList
                motions={this.state.meeting.pendingMotions}
                config={this.props.config}
              />
              <MotionList
                showStatus
                motions={this.state.meeting.motionHistory}
                config={this.props.config}
              />
            </Row>
          </div>
        </div>
      );
    } else {
      return <h1>Meeting loading, please standby</h1>;
    }
  }
}

export default withRouter(ChairMeeting);
