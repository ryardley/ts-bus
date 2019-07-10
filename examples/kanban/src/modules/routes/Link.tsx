import React, { useCallback, SyntheticEvent } from "react";
import { useBus } from "ts-bus/react";
import { navigationRequested } from "./events";
import { createHref } from "./createHref";

export type Location =
  | string
  | {
      pathname: string;
      search: string;
      hash: string;
      state: any;
    };

type Props = {
  as?: React.ComponentType<any> | "a" | "div" | "button";
  to: Location;
  replace?: boolean;
  title?: string;
  id?: string;
  className?: string;
  children?: React.ReactNode;
};

export default ({ as = "a", children, to, replace, ...rest }: Props) => {
  const { publish } = useBus();

  const handleClick = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault();

      publish(navigationRequested({ to, replace }));
    },
    [publish, to, replace]
  );

  return React.createElement(
    as,
    Object.assign(
      {},
      as === "a" && { href: createHref(to) },
      { onClick: handleClick },
      rest
    ),
    children
  );
};
