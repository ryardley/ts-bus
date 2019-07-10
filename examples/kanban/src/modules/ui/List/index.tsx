import React from "react";
import styled from "styled-components";
import ListMenu from "./ListMenu";

const ListTitle = styled.h2`
  line-height: 4rem;
  font-size: 2rem;
  margin: 0 0 1rem;
`;

const ListTitleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const ListItems = styled.div``;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #ddd;
`;

type Props = {
  id: string;
  innerRef: any;
  children?: React.ReactNode;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  menu?: React.ReactNode;
};

export const ListItem = styled.div`
  margin-bottom: 1rem;
`;

const List = ({
  children,
  id,
  innerRef,
  footer,
  menu,
  title = "unknown title",
  ...rest
}: Props) => (
  <ListContainer>
    <ListTitleRow>
      <ListTitle>{title}</ListTitle>
      <ListMenu id={id}>{menu}</ListMenu>
    </ListTitleRow>
    <ListItems ref={innerRef} {...rest}>
      {children}
      {footer}
    </ListItems>
  </ListContainer>
);

List.Item = ListItem;

export default List;
