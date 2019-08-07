import { createEventDefinition } from "../../../../../dist";

export const navigationRequested = createEventDefinition<{
  to:
    | string
    | {
        pathname: string;
        search: string;
        hash: string;
        state: any;
      };
  replace?: boolean;
}>()("navigation.request");

export type RouteEvent = ReturnType<typeof navigationRequested>;
