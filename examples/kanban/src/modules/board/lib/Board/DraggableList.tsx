import React from "react";
import List from "../../../ui/List";
import Icon from "../../../ui/Icon";
import Button from "../../../ui/Button";
import { useControlledUncontrolled } from "../../../../lib/useControlledUncontrolled";
import {
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided
} from "react-beautiful-dnd";
import { Task, WithId } from "../../types";
import { EditableCard } from "./EditableCard";
import InlineEditableText from "../../../ui/InlineEditableText";
type Props = {
  id: string;
  items: WithId<Task>[];
  title: string;
  onListTitleChanged: (title: string) => void;
  onCardClick: (card: WithId<Task>) => void;
  onListDelete: () => void;
  footer?: React.ReactNode;
};

export default ({
  items,
  title,
  id,
  footer,
  onCardClick,
  onListTitleChanged,
  onListDelete
}: Props) => {
  const [value, onCommit, onChange] = useControlledUncontrolled(
    title,
    onListTitleChanged
  );

  return (
    <Droppable droppableId={id}>
      {(dropProvided: DroppableProvided) => (
        <List
          id={id}
          title={
            <InlineEditableText onEnterPressed={onCommit} onChange={onChange}>
              {value || "Untitled list"}
            </InlineEditableText>
          }
          innerRef={dropProvided.innerRef}
          menu={
            <>
              <Button
                onClick={onListDelete}
                prefix={<Icon icon="Bin" size="small" />}
              >
                Delete
              </Button>
            </>
          }
          footer={
            <>
              {dropProvided.placeholder}
              {footer}
            </>
          }
          {...dropProvided.droppableProps}
        >
          {items.map((card, index) => (
            <Draggable
              key={card.id}
              draggableId={id + "_" + card.id}
              index={index}
            >
              {(dragProvided: DraggableProvided) => (
                <List.Item
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  {...dragProvided.dragHandleProps}
                >
                  <EditableCard card={card} onClick={onCardClick} />
                </List.Item>
              )}
            </Draggable>
          ))}
        </List>
      )}
    </Droppable>
  );
};
