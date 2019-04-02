import React from 'react';

import { Link } from 'react-router-dom';

import { buildRequest } from '../utils';

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

  render() {
    if (this.state.meeting) {
      return (
        <div>
          <h1>{this.state.meeting.name}</h1>
          <Link to="/home">Bye</Link>
        </div>
      );
    } else {
      return <h1>Meeting loading</h1>;
    }
  }
}

export default ChairMeeting;
