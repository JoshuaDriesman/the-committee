import React from 'react';
import styled from '@emotion/styled';

const Section = props => {
  const StyledContainer = styled.div`
    min-width: 200px;
    margin: 15px;
  `;
  const StyledTitle = styled.div`
    font-weight: bold;
    font-size: 18px;
  `;
  const StyledBody = styled.div`
    margin-left: ${props.indent ? '20px' : '0px'};
  `;

  return (
    <StyledContainer className={props.className}>
      <StyledTitle>{props.title}</StyledTitle>
      <StyledBody>{props.children}</StyledBody>
    </StyledContainer>
  );
};

export default Section;
