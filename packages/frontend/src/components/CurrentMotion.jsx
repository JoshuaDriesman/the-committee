import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import styled from '@emotion/styled';

import { buildRequest } from '../utils';

const CurrentMotion = props => {
  const StyledButtonSection = styled.div`
    align: center;
  `;

  const StyledButton = styled(Button)`
    margin-right: 15px !important;
  `;

  const StyledVoteInProgress = styled.div`
    display: flex;
    flex-direction: row;
  `;

  const StyledVotingCounts = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 10px;
  `;

  const StyledCount = styled.div`
    margin-bottom: 10px;
  `;

  const handleWithdraw = async () => {
    const req = buildRequest(
      props.config.apiRoot + `/motion/${props.motion._id}/withdraw`,
      'PATCH',
      { meetingId: sessionStorage.getItem('meetingId') },
      sessionStorage.getItem('auth')
    );

    const res = await fetch(req);

    if (res.status !== 200) {
      props.setError(await res.text());
    }
  };

  const handleVote = async () => {
    const req = buildRequest(
      props.config.apiRoot + `/voting/begin`,
      'POST',
      { meetingId: sessionStorage.getItem('meetingId') },
      sessionStorage.getItem('auth')
    );

    const res = await fetch(req);

    if (res.status !== 200) {
      props.setError(await res.text());
    }
  };

  const handleEndVote = async () => {
    const req = buildRequest(
      props.config.apiRoot + `/voting/end`,
      'POST',
      { meetingId: sessionStorage.getItem('meetingId') },
      sessionStorage.getItem('auth')
    );

    const res = await fetch(req);

    if (res.status !== 200) {
      props.setError(await res.text());
    }
  };

  return (
    <React.Fragment>
      <p>Name: {props.motion ? props.motion.userFriendlyName : 'N/A'}</p>
      <p>Type: {props.motion ? props.motion.motionType.name : 'N/A'}</p>
      <p>Class: {props.motion ? props.motion.motionType.motionType : 'N/A'}</p>
      <p>Made By: {props.motion ? props.motion.owner.lastName : 'N/A'}</p>
      <p>
        Seconded By:{' '}
        {props.motion && props.motion.secondedBy
          ? props.motion.secondedBy.lastName
          : 'N/A'}
      </p>
      {props.motion &&
        !props.participant &&
        (!props.votingRecord ? (
          <StyledButtonSection>
            <StyledButton onClick={handleWithdraw}>Withdraw</StyledButton>
            <StyledButton onClick={handleVote}>Vote</StyledButton>
          </StyledButtonSection>
        ) : (
          <StyledVoteInProgress>
            <StyledButton onClick={handleEndVote}>End Vote</StyledButton>
            <StyledVotingCounts>
              <StyledCount>
                {'Yes: '}
                {
                  props.votingRecord.votes.filter(v => v.voteState === 'yes')
                    .length
                }
              </StyledCount>
              <StyledCount>
                {'No: '}
                {
                  props.votingRecord.votes.filter(v => v.voteState === 'no')
                    .length
                }
              </StyledCount>
              <StyledCount>
                {'Abstain: '}
                {
                  props.votingRecord.votes.filter(
                    v => v.voteState === 'abstain'
                  ).length
                }
              </StyledCount>
              <StyledCount>
                {'Pending: '}
                {
                  props.votingRecord.votes.filter(
                    v => v.voteState === 'pending'
                  ).length
                }
              </StyledCount>
            </StyledVotingCounts>
          </StyledVoteInProgress>
        ))}
    </React.Fragment>
  );
};

CurrentMotion.propTypes = {
  votingRecord: PropTypes.object,
  participant: PropTypes.bool,
  motion: PropTypes.any
};

export default CurrentMotion;
