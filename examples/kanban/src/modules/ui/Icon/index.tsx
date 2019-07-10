import React from "react";

import { Bin } from "styled-icons/icomoon/Bin";
import { ChevronDown } from "styled-icons/boxicons-regular/ChevronDown";
import { ChevronUp } from "styled-icons/boxicons-regular/ChevronUp";
import { Close } from "styled-icons/evil/Close";
import { Edit3 } from "styled-icons/feather/Edit3";
import { HomeAlt } from "styled-icons/boxicons-regular/HomeAlt";
import { Plus } from "styled-icons/feather/Plus";
import { User } from "styled-icons/boxicons-solid/User";

export const Icons = {
  Bin,
  ChevronDown,
  ChevronUp,
  Close,
  Edit3,
  HomeAlt,
  Plus,
  User
};

export type Props = {
  icon: keyof typeof Icons;
  size?: "small" | "medium" | "large";
};

export default ({ icon, size = "medium", ...rest }: Props) => {
  const Comp = Icons[icon];

  return <Comp {...rest} size={{ small: 16, medium: 24, large: 36 }[size]} />;
};
