import styled from "styled-components";

export const Columns = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  & > * {
    margin-right: 1rem;
  }
`;

export const Column = styled.div`
  width: 300px;
`;

export const BoardContainer = styled.div`
  display: flex;
  padding: 1rem;
`;
