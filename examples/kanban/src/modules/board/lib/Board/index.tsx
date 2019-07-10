import React, { useCallback } from "react";

import { DropResult } from "react-beautiful-dnd";

import { useBus } from "ts-bus/react";
import {
  taskMoved,
  taskCreated,
  listCreated,
  listTitleChanged,
  listDeleted
} from "../../events";

import { toTaskMovedPayload } from "./utils";

import { BoardView } from "./BoardView";
import { navigationRequested } from "../../../routes/events";
import { WithId, Task } from "../../types";
import uuid from "uuid/v4";

type Props = {
  lists: {
    [id: string]: {
      label: string;
      items: string[];
    };
  };
  tasks: {
    [id: string]: Omit<Task, "id">;
  };
};

function denormalizeLists(
  lists: {
    [id: string]: {
      label: string;
      items: string[];
    };
  },
  tasks: {
    [id: string]: Omit<Task, "id">;
  }
) {
  return Object.entries(lists).map(([id, { label, items = [] }]) => ({
    id,
    label,
    items: items.map((taskId: string) => {
      const task = tasks[taskId];
      return {
        id: taskId,
        ...task
      };
    })
  }));
}
export default function Board({ lists, tasks }: Props) {
  const { publish } = useBus();

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || !result.source) return;
      publish(taskMoved(toTaskMovedPayload(result)));
    },
    [publish]
  );

  const handleNewTaskCreated = useCallback(
    ({ value, listId }) => {
      publish(taskCreated({ id: uuid(), value, listId }));
    },
    [publish]
  );

  const handleCardClick = useCallback(
    (card: WithId<Task>) => {
      publish(navigationRequested({ to: `/card/${card.id}/edit` }));
    },
    [publish]
  );

  const handleNewListCreated = useCallback(() => {
    const event = listCreated({ id: uuid() });
    publish(event);
  }, [publish]);

  const handleListTitleChanged = useCallback(
    ({ id, title }: { id: string; title: string }) => {
      publish(listTitleChanged({ id, title }));
    },
    [publish]
  );
  const handleListDelete = useCallback(
    (id: string) => {
      publish(listDeleted({ id }));
    },
    [publish]
  );
  return (
    <BoardView
      lists={denormalizeLists(lists, tasks)}
      onDragEnd={handleDragEnd}
      onNewTaskCreated={handleNewTaskCreated}
      onNewListCreated={handleNewListCreated}
      onListTitleChanged={handleListTitleChanged}
      onListDelete={handleListDelete}
      onCardClick={handleCardClick}
    />
  );
}
