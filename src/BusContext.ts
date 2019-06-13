import React, { useContext } from "react";
import { EventBus } from "./EventBus";

const BusContext = React.createContext<EventBus>(new EventBus());
export const useBus = () => useContext(BusContext);
export const BusProvider = BusContext.Provider;
