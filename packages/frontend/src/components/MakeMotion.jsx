import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';

import styled from '@emotion/styled';

import { buildRequest } from '../utils';

const MakeMotion = props => {
  const motionRows = props.motionTypes.map(m => (
    <MenuItem key={m._id} value={m._id}>
      {m.name}
    </MenuItem>
  ));

  const memberRows = props.members.map(m => (
    <MenuItem key={m._id} value={m._id}>
      {m.firstName + ' ' + m.lastName}
    </MenuItem>
  ));

  const getMotionTypeDetailsById = id => {
    const filteredType = props.motionTypes.filter(m => m._id === id);
    return filteredType.length === 1 && filteredType[0];
  };

  const [motionType, setMotionType] = useState('');
  const [requiresSecond, setRequiresSecond] = useState(false);
  const handleChangeMotionType = event => {
    setMotionType(event.target.value);
    const motionDetails = getMotionTypeDetailsById(event.target.value);
    setRequiresSecond(motionDetails && motionDetails.requiresSecond);
  };

  const [name, setName] = useState('');
  const handleChangeName = event => {
    setName(event.target.value);
  };

  const [madeBy, setMadeBy] = useState('');
  const handleChangeMadeBy = event => {
    setMadeBy(event.target.value);
  };

  const [secondedBy, setSecondedBy] = useState('');
  const handleSecondedBy = event => {
    setSecondedBy(event.target.value);
  };

  const handleSubmit = async () => {
    if (motionType === '' || madeBy === '' || name === '') {
      return props.setError('All fields are required to make motion');
    }

    const req = buildRequest(
      props.config.apiRoot + '/motion',
      'POST',
      {
        motionTypeId: motionType,
        ownerId: madeBy,
        meetingId: sessionStorage.getItem('meetingId'),
        secondedById: secondedBy !== '' ? secondedBy : undefined,
        effectId: props.currentMotion ? props.currentMotion._id : undefined,
        userFriendlyName: name
      },
      sessionStorage.getItem('auth')
    );

    const res = await fetch(req);

    if (res.status !== 200) {
      props.setError(await res.text());
    }
  };

  const StyledSubmitButton = styled(Button)`
    margin-top: 10px !important;
  `;

  return (
    <React.Fragment>
      <FormControl fullWidth>
        <InputLabel htmlFor="motion-type">Motion Type </InputLabel>
        <Select
          value={motionType}
          onChange={handleChangeMotionType}
          placeholder="Select Motion Type"
          inputProps={{
            id: 'motion-type'
          }}
        >
          {motionRows}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel htmlFor="motion-name">Motion Name </InputLabel>
        <Input
          fullWidth
          onChange={handleChangeName}
          inputProps={{
            id: 'motion-name'
          }}
        />
      </FormControl>
      <FormControl fullWidth>
        <InputLabel htmlFor="made-by">Made By</InputLabel>
        <Select
          value={madeBy}
          onChange={handleChangeMadeBy}
          inputProps={{
            id: 'made-by'
          }}
        >
          {memberRows}
        </Select>
      </FormControl>
      {requiresSecond && (
        <FormControl fullWidth>
          <InputLabel htmlFor="seconded-by">Seconded By</InputLabel>
          <Select
            value={secondedBy}
            onChange={handleSecondedBy}
            inputProps={{
              id: 'seconded-by'
            }}
          >
            {memberRows}
          </Select>
        </FormControl>
      )}
      <StyledSubmitButton fullWidth onClick={handleSubmit}>
        Make Motion
      </StyledSubmitButton>
    </React.Fragment>
  );
};

MakeMotion.propTypes = {
  motionTypes: PropTypes.arrayOf(PropTypes.object),
  members: PropTypes.arrayOf(PropTypes.object),
  config: PropTypes.object,
  currentMotion: PropTypes.any,
  setError: PropTypes.func
};

export default MakeMotion;
