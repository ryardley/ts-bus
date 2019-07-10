import React from "react";
import Button, { Props as ButtonProps } from "../Button";
import Icon, { Props as IconProps } from "../Icon";
type Props = IconProps & ButtonProps;

export default ({ icon, size, ...rest }: Props) => (
  <Button kind="link" {...rest}>
    <Icon icon={icon} size={size} />
  </Button>
);
