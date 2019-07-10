import { DropResult } from "react-beautiful-dnd";

export const toTaskMovedPayload = (result: DropResult) => {
  const { source, destination } = result;
  return {
    destination: {
      id: destination!.droppableId,
      index: destination!.index
    },
    source: {
      id: source.droppableId,
      index: source.index
    }
  };
};
