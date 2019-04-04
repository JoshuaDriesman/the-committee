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
      {!props.votingRecord && (
        <StyledButtonSection>
          <StyledButton onClick={handleWithdraw}>Withdraw</StyledButton>
          <StyledButton>Vote</StyledButton>
        </StyledButtonSection>
      )}
    </React.Fragment>
  );
};

CurrentMotion.propTypes = {
  votingRecord: PropTypes.object,
  motion: PropTypes.object
};

export default CurrentMotion;
