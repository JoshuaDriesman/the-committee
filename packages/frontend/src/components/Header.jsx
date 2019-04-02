import React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';

import styled from '@emotion/styled';

const Header = props => {
  const StyledAppBar = styled(AppBar)`
    display: flex;
    flex-direction: row !important;
    background-color: grey !important;
    padding-bottom: 10px;
    padding-top: 10px;
    position: inherit !important;
  `;
  const StyledTitle = styled.div`
    margin-left: 10px;
    font-size: 36px;
    flex: 0.33;
  `;
  const StyledWelcome = styled.div`
    font-size: 36px;
    text-align: center;
    flex: 0.33;
  `;
  const StyledButtonWrapper = styled.div`
    text-align: right;
    margin-top: 5px;
    flex: 0.33;
  `;
  const StyledButton = styled(Button)`
    color: white !important;
  `;

  return (
    <StyledAppBar>
      <StyledTitle>The Committee</StyledTitle>
      <StyledWelcome>{props.centerMessage}</StyledWelcome>
      <StyledButtonWrapper>
        <StyledButton onClick={props.buttonAction}>
          {props.buttonText}
        </StyledButton>
      </StyledButtonWrapper>
    </StyledAppBar>
  );
};

Header.propTypes = {
  centerMessage: PropTypes.string,
  buttonAction: PropTypes.func,
  buttonText: PropTypes.string
};

export default Header;
