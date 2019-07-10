import React, { useContext, useCallback } from "react";
import { RouteComponentProps } from "react-router-dom";
import Board from "../lib/Board";
import { BoardContext } from "../app";
import { useBus } from "ts-bus/react";
import { navigationRequested } from "../../routes/events";
import CardEditorModal from "../lib/CardEditorModal";
import { WithId, Task } from "../types";
import { taskUpdated, taskDeleted } from "../events";

export default ({ match }: RouteComponentProps<{ cardId: string }>) => {
  const state = useContext(BoardContext);
  const { publish } = useBus();

  const handleCloseEditorRequest = useCallback(
    ({ id, ...task }: WithId<Task>) => {
      publish(taskUpdated({ id, task }));
      publish(navigationRequested({ to: "/" }));
    },
    [publish]
  );

  const handleDeleteEditorRequest = useCallback(
    (id: string) => {
      publish(taskDeleted({ id }));
    },
    [publish]
  );

  const card = match.params.cardId
    ? { id: match.params.cardId, ...state.tasks[match.params.cardId] }
    : undefined;

  return (
    <div>
      <Board lists={state.lists} tasks={state.tasks} />
      <CardEditorModal
        visible={!!match.params.cardId}
        card={card || { id: "", label: "" }}
        onClose={handleCloseEditorRequest}
        onDelete={handleDeleteEditorRequest}
      />
    </div>
  );
};
