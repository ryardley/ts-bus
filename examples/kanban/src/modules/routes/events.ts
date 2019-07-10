import { defineEvent } from "ts-bus";

export const navigationRequested = defineEvent<{
  type: "navigation.request";
  payload: {
    to:
      | string
      | {
          pathname: string;
          search: string;
          hash: string;
          state: any;
        };
    replace?: boolean;
  };
}>("navigation.request");

export type RouteEvent = ReturnType<typeof navigationRequested>;
