import React, { useState, useCallback } from "react";

import DraggableList from "./DraggableList";
import { NewTaskEditor } from "./NewTaskEditor";
import Button from "../../../ui/Button";
import Icon from "../../../ui/Icon";
import styled from "styled-components";
import { WithId, Task } from "../../types";

const ListFooter = styled.div``;

type BoardListProps = {
  id: string;
  label: string;
  items: WithId<Task>[];
  onNewTaskCreated: (a: { value: string; listId: string }) => void;
  onTitleChanged: (a: { id: string; title: string }) => void;
  onCardClick: (card: WithId<Task>) => void;
  onListDelete: (id: string) => void;
};

export function BoardList({
  id,
  label,
  items,
  onNewTaskCreated,
  onTitleChanged,
  onListDelete,
  onCardClick
}: BoardListProps) {
  const [isEditing, setEditing] = useState<boolean>(false);

  const handleAddTaskClick = useCallback(() => {
    setEditing(true);
  }, [setEditing]);

  const handleNewTaskCreated = useCallback(
    (value: string) => {
      setEditing(false);
      if (value) {
        onNewTaskCreated({ value, listId: id });
      }
    },
    [onNewTaskCreated, setEditing, id]
  );

  const handleTitleChanged = useCallback(
    (title: string) => {
      onTitleChanged({ id, title });
    },
    [id, onTitleChanged]
  );

  const handleListDelete = useCallback(() => {
    onListDelete(id);
  }, [id, onListDelete]);

  return (
    <DraggableList
      id={id}
      title={label}
      items={items}
      onCardClick={onCardClick}
      onListTitleChanged={handleTitleChanged}
      onListDelete={handleListDelete}
      footer={
        <ListFooter>
          {isEditing && <NewTaskEditor onChange={handleNewTaskCreated} />}
          <Button
            onClick={handleAddTaskClick}
            kind="link"
            prefix={<Icon icon="Plus" size="small" />}
          >
            Add Card
          </Button>
        </ListFooter>
      }
    />
  );
}
