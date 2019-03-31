import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

const ErrorSnackbar = props => {
  return (
    <Snackbar
      open={props.error !== ''}
      autoHideDuration={5000}
      message={props.error}
      onClose={() => props.setError('')}
    />
  );
};

export default ErrorSnackbar;
