import React, { useCallback } from "react";
import Card from "../../../ui/Card";
import { Task, WithId } from "../../types";
import Icon from "../../../ui/Icon";
import styled from "styled-components";

const IconHover = styled(Icon).attrs({ icon: "Edit3", size: "small" })`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 99;
`;

const EditIconOverLay = styled.div`
  position: relative;
  & ${IconHover} {
    display: none;
  }
  &:hover ${IconHover} {
    display: block;
  }
`;

type EditableCardProps = {
  card: WithId<Task>;
  onClick?: (card: WithId<Task>) => void;
};

function EditableHoverIcon({ children }: { children: React.ReactNode }) {
  return (
    <EditIconOverLay>
      {children}
      <IconHover />
    </EditIconOverLay>
  );
}

export function EditableCard({ card, onClick }: EditableCardProps) {
  const handleEditableCardClicked = useCallback(() => {
    if (onClick) onClick(card);
  }, [card, onClick]);

  return (
    <EditableHoverIcon>
      <Card onClick={handleEditableCardClicked}>{card.label}</Card>
    </EditableHoverIcon>
  );
}
