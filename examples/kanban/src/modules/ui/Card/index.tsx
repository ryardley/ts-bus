import React from "react";
import styled from "styled-components";

const CardContainer = styled.div`
  display: flex;
  padding: 1rem;
  background: white;
  border-radius: 0.2rem;
  border-bottom: 1px solid #aaa;
`;

type Props = {
  innerRef?: any;
  onClick?: () => void;
  children?: React.ReactNode;
};

export default ({ children, innerRef, ...rest }: Props) => (
  <CardContainer {...rest} ref={innerRef}>
    {children}
  </CardContainer>
);
