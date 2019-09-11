import React from "react";

import { useBusReducer } from "../../../../../dist/react";
import { initState, reducer, BoardEvent } from "./events";

export const BoardContext = React.createContext(initState);

function BoardApp({ children }: { children: React.ReactNode }) {
  const state = useBusReducer<BoardEvent>(reducer, initState);

  return (
    <BoardContext.Provider value={state}>{children}</BoardContext.Provider>
  );
}

export default BoardApp;
