import React from "react";
import styled from "styled-components";
import Link from "../routes/Link";
import Icon from "../ui/Icon";

const Heading = styled.h1`
  margin-left: 1rem;
  margin-right: 1rem;
`;
const Nav = styled.div`
  margin-right: 2rem;
`;

const TitleRow = styled.div`
  padding-left: 1rem;
  display: flex;
  flex-flow: row no-wrap;
  align-items: center;
  justify-content: space-between;
`;

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TitleRow>
        <Heading>A List Editing App</Heading>
        <Nav>
          <Link to={"/"}>
            <Icon icon="HomeAlt" size="small" />
          </Link>
          <Link to={"/settings"}>
            <Icon icon="User" size="small" />
          </Link>
        </Nav>
      </TitleRow>

      {children}
    </>
  );
}

export default Layout;
