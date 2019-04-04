import React from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@material-ui/core';

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

  return (
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
  );
};

ParticipantList.propTypes = {
  attendanceRecords: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ParticipantList;
