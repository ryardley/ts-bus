import React from "react";
import styled from "styled-components";
import IconButton from "../../../ui/IconButton";
import RawInlineEditableText from "../../../ui/InlineEditableText";

const InlineEditableText = styled(RawInlineEditableText)`
  padding: 1rem;
  min-width: 20rem;
`;

const Pane = styled.div`
  background: white;
  padding: 2rem;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const TrashIconButton = styled(IconButton).attrs({
  icon: "Bin",
  size: "small"
})`
  color: darksalmon;
`;

export function CardEditor({
  value,
  onChange,
  onEnterPressed,
  onDelete
}: {
  value: string;
  onEnterPressed: () => void;
  onChange: (value: string) => void;
  onDelete: () => void;
}) {
  return (
    <Pane>
      <Row>
        <InlineEditableText onEnterPressed={onEnterPressed} onChange={onChange}>
          {value}
        </InlineEditableText>
        <TrashIconButton onClick={onDelete} />
      </Row>
    </Pane>
  );
}
