import produce from "immer";

import { Task, List } from "./types";

import { defineEvent } from "ts-bus";

export const taskMoved = defineEvent<{
  type: "shared.task.moved";
  payload: {
    source: { id: string; index: number };
    destination: { id: string; index: number };
  };
}>("shared.task.moved");

export const taskCreated = defineEvent<{
  type: "shared.task.created";
  payload: {
    id: string;
    listId: string;
    value: string;
  };
}>("shared.task.created");

export const taskUpdated = defineEvent<{
  type: "shared.task.updated";
  payload: {
    id: string;
    task: { label: string };
  };
}>("shared.task.updated");

export const taskDeleted = defineEvent<{
  type: "shared.task.deleted";
  payload: {
    id: string;
  };
}>("shared.task.deleted");

export const listCreated = defineEvent<{
  type: "shared.list.created";
  payload: { id: string };
}>("shared.list.created");

export const listTitleChanged = defineEvent<{
  type: "shared.list.title.changed";
  payload: {
    id: string;
    title: string;
  };
}>("shared.list.title.changed");

export const listDeleted = defineEvent<{
  type: "shared.list.deleted";
  payload: { id: string };
}>("shared.list.deleted");

export type BoardEvent =
  | ReturnType<typeof taskMoved>
  | ReturnType<typeof taskCreated>
  | ReturnType<typeof taskUpdated>
  | ReturnType<typeof taskDeleted>
  | ReturnType<typeof listTitleChanged>
  | ReturnType<typeof listDeleted>
  | ReturnType<typeof listCreated>;

type State = {
  tasks: {
    [k: string]: Task;
  };
  lists: {
    [k: string]: List;
  };
};

export const initState: State = {
  tasks: {},
  lists: {}
};

export const reducer = produce((state: State, action: BoardEvent) => {
  switch (action.type) {
    case "shared.task.moved": {
      const { payload } = action;
      const { source, destination } = payload;
      const [item] = state.lists[source.id].items.splice(source.index, 1);
      state.lists[destination.id].items.splice(destination.index, 0, item);
      return state;
    }

    case "shared.task.created": {
      const {
        payload: { id, listId, value }
      } = action;

      state.tasks[id] = { label: value };
      state.lists[listId].items.push(id);
      return state;
    }

    case "shared.task.updated": {
      const {
        payload: { id, task }
      } = action;
      state.tasks[id] = task;
      return state;
    }

    case "shared.task.deleted": {
      const {
        payload: { id }
      } = action;

      state.lists = Object.entries(state.lists).reduce((acc, [key, list]) => {
        const newList = {
          ...list,
          items: list.items.filter(taskId => taskId !== id)
        };
        return { ...acc, [key]: newList };
      }, {});
      delete state.tasks[id];

      return state;
    }

    case "shared.list.created": {
      const {
        payload: { id }
      } = action;
      state.lists[id] = { label: "", items: [] };
      return state;
    }

    case "shared.list.title.changed": {
      const {
        payload: { id, title }
      } = action;

      state.lists[id].label = title;
      return state;
    }
    case "shared.list.deleted": {
      const {
        payload: { id }
      } = action;

      delete state.lists[id];
      return state;
    }

    default:
      return state;
  }
});
