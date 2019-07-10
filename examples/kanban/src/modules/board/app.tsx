import React from "react";

import { useBusReducer } from "ts-bus/react";
import { initState, reducer, BoardEvent } from "./events";

export const BoardContext = React.createContext(initState);

function BoardApp({ children }: { children: React.ReactNode }) {
  const state = useBusReducer<BoardEvent>(initState, reducer);

  return (
    <BoardContext.Provider value={state}>{children}</BoardContext.Provider>
  );
}

export default BoardApp;
