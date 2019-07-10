import React from "react";

import {
  DragDropContext,
  DropResult,
  ResponderProvided
} from "react-beautiful-dnd";
import ListMenuController from "../../../ui/List/ListMenuController";
import { BoardContainer, Columns, Column } from "./styles";
import { BoardList } from "./BoardList";

import Icon from "../../../ui/Icon";
import Button from "../../../ui/Button";
import { WithId, Task } from "../../types";

type Props = {
  lists: {
    id: string;
    label: string;
    items: WithId<Task>[];
  }[];

  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  onNewTaskCreated: (a: { value: string; listId: string }) => void;
  onNewListCreated: () => void;
  onListTitleChanged: (a: { id: string; title: string }) => void;
  onCardClick: (card: WithId<Task>) => void;
  onListDelete: (id: string) => void;
};

export const BoardView = ({
  lists,
  onDragEnd,
  onNewTaskCreated,
  onNewListCreated,
  onListTitleChanged,
  onListDelete,
  onCardClick
}: Props) => (
  <BoardContainer>
    <DragDropContext onDragEnd={onDragEnd}>
      <Columns>
        <ListMenuController>
          {lists.map(({ id, label, items }) => (
            <Column key={id}>
              <BoardList
                id={id}
                label={label}
                items={items}
                onCardClick={onCardClick}
                onNewTaskCreated={onNewTaskCreated}
                onTitleChanged={onListTitleChanged}
                onListDelete={onListDelete}
              />
            </Column>
          ))}
        </ListMenuController>
        <Column>
          <Button onClick={onNewListCreated} prefix={<Icon icon="Plus" />}>
            Add List
          </Button>
        </Column>
      </Columns>
    </DragDropContext>
  </BoardContainer>
);
