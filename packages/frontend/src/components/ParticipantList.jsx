import React from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@material-ui/core';
import styled from '@emotion/styled';

const ParticipantList = props => {
  const rows = [];

  props.attendanceRecords.forEach(ar => {
    rows.push(
      <TableRow key={ar._id}>
        <TableCell>{ar.member.firstName}</TableCell>
        <TableCell>{ar.member.lastName}</TableCell>
        <TableCell>{ar.status === 'present' ? '✓' : 'X'}</TableCell>
        <TableCell>{ar.voting ? '✓' : 'X'}</TableCell>
      </TableRow>
    );
  });

  const StyledThresholds = styled.div`
    font-size: 12px;
    margin-left: 20px;
  `;

  const quorum = Math.ceil(props.attendanceRecords.length / 2);

  const attendanceCount = props.attendanceRecords.filter(
    ar => ar.status === 'present' && ar.voting
  ).length;

  const majorityThreshold = Math.ceil(attendanceCount / 2);

  const twoThirdsThreshold = Math.ceil((attendanceCount * 2) / 3);

  return (
    <React.Fragment>
      <StyledThresholds>
        <p>
          Quorum Threshold: {quorum} ({attendanceCount >= quorum ? '✓' : 'X'})
        </p>
        <p>Majority Threshold: {majorityThreshold}</p>
        <p>2/3rds Threshold: {twoThirdsThreshold}</p>
      </StyledThresholds>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>First</TableCell>
            <TableCell>Last</TableCell>
            <TableCell>Present</TableCell>
            <TableCell>Voting</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </React.Fragment>
  );
};

ParticipantList.propTypes = {
  attendanceRecords: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ParticipantList;
