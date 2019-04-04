import React from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@material-ui/core';
import moment from 'moment';

const statusToCode = status => {
  switch (status) {
    case 'tabled':
      return 'T';
    case 'accepted':
      return 'A';
    case 'rejected':
      return 'R';
    case 'withdrawn':
      return 'W';
    default:
      return 'P'; // for pending
  }
};

const MotionList = props => {
  let motionRows = [];
  props.motions.forEach(motion => {
    const row = (
      <TableRow key={motion._id}>
        <TableCell>{motion.userFriendlyName}</TableCell>
        <TableCell>{motion.motionType.name}</TableCell>
        <TableCell>
          {motion.motionType.motionType.charAt(0).toUpperCase() +
            motion.motionType.motionType.slice(1)}
        </TableCell>
        <TableCell>{motion.owner.lastName}</TableCell>
        <TableCell>
          {moment(motion.dateTimeMade)
            .local()
            .format('hh:mm:ss a')}
        </TableCell>
        {props.showStatus && (
          <TableCell>{statusToCode(motion.motionStatus)}</TableCell>
        )}
      </TableRow>
    );

    motionRows.push(row);
  });

  motionRows = motionRows.reverse();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Motion Type</TableCell>
          <TableCell>Motion Class</TableCell>
          <TableCell>Made By</TableCell>
          <TableCell>Made At</TableCell>
          {props.showStatus && <TableCell>Status</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>{motionRows}</TableBody>
    </Table>
  );
};

MotionList.propTypes = {
  showStatus: PropTypes.bool,
  motions: PropTypes.arrayOf(PropTypes.object)
};

export default MotionList;
