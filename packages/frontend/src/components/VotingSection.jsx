import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { buildRequest } from '../utils';
import { RadioGroup, Radio, FormControlLabel, Button } from '@material-ui/core';

const VotingSection = props => {
  const StyledNoVote = styled.h1`
    margin-left: 30%;
    margin-top: 30%;
  `;

  const StyledTitle = styled.h1`
    font-size: 24px;
  `;

  const StyledVotingOptions = styled.div`
    display: flex;
    flex-direction: row;
    margin-left: 30px;
  `;

  const StyledVoteButton = styled(Button)`
    margin-left: 20px !important;
    margin-top: 50px !important;
    height: 40px !important;
  `;

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser) {
        const req = buildRequest(
          props.config.apiRoot + '/user',
          'GET',
          undefined,
          sessionStorage.getItem('auth')
        );

        const res = await fetch(req);
        if (res.status !== 200) {
          console.error(`Got ${res.status} when getting user`);
        } else {
          setCurrentUser(await res.json());
        }
      }
    };

    fetchUser();
  });

  const [currentVoteState, setVoteState] = useState('abstain');

  const onSetVoteState = async event => {
    setVoteState(event.target.value);
  };

  const handleSubmitVote = async () => {
    const req = buildRequest(
      props.config.apiRoot + '/voting/vote',
      'PATCH',
      {
        meetingId: props.meetingId,
        voteState: currentVoteState
      },
      sessionStorage.getItem('auth')
    );

    const res = await fetch(req);

    if (res.code !== 200) {
      console.error('Bad response');
    }
  };

  if (props.votingRecord && currentUser) {
    const voteList = props.votingRecord.votes.filter(
      v => v.member === currentUser._id
    );

    const vote = voteList.length === 1 ? voteList[0] : null;

    return (
      <React.Fragment>
        <StyledTitle>Vote on: {props.motionName}</StyledTitle>
        {vote && vote.voteState === 'pending' ? (
          <StyledVotingOptions>
            <RadioGroup value={currentVoteState} onChange={onSetVoteState}>
              <FormControlLabel
                value="abstain"
                control={<Radio />}
                label="Abstain"
              />
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
            <StyledVoteButton onClick={handleSubmitVote}>Vote</StyledVoteButton>
          </StyledVotingOptions>
        ) : (
          <StyledNoVote>Vote Submitted</StyledNoVote>
        )}
      </React.Fragment>
    );
  } else {
    return <StyledNoVote>No Vote in Progress</StyledNoVote>;
  }
};

export default VotingSection;
