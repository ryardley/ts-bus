import React, { useState, createContext } from "react";

type MenuController = {
  currentMenu?: string;
  registerOpenMenu: (id: string) => void;
};

export const ListMenuContext = createContext<[string, (id: string) => void]>([
  "",
  () => {}
]);

export default function ListMenuController({
  children
}: {
  children: React.ReactNode;
}) {
  const menuState = useState("");

  return (
    <ListMenuContext.Provider value={menuState}>
      {children}
    </ListMenuContext.Provider>
  );
}
