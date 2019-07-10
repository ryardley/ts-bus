import React, { useCallback, useContext } from "react";
import styled from "styled-components";
import IconButton from "../IconButton";
import { ListMenuContext } from "./ListMenuController";

const ListMenuCarrot = styled(IconButton)``;

const ListMenuHolder = styled.div`
  position: relative;
`;

const ListMenuButtons = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  z-index: 1000;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
`;

export default function ListMenu({
  children,
  id
}: {
  id: string;
  children: React.ReactNode;
}) {
  const [currentOpenMenu, setOpenMenu] = useContext(ListMenuContext);

  const open = currentOpenMenu === id;

  const handleListClick = useCallback(() => {
    setOpenMenu(open ? "" : id);
  }, [setOpenMenu, id, open]);

  return (
    <ListMenuHolder>
      <ListMenuCarrot
        icon={open ? "ChevronUp" : "ChevronDown"}
        onClick={handleListClick}
      />
      {open && <ListMenuButtons>{children}</ListMenuButtons>}
    </ListMenuHolder>
  );
}
