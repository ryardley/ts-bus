import React from "react";
import { Button } from "reakit/Button";
import styled, { css } from "styled-components";

export type Props = {
  className?: string;
  as?: any;
  kind?: "primary" | "secondary" | "ghost" | "link";
  size?: "small" | "medium" | "large";
  children?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onClick?: (event: React.SyntheticEvent<HTMLButtonElement>) => void;
};

const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-content: center;
`;

const StyledButton = styled(Button)`
  ${({ size }: Props) => {
    if (size === "small") {
      return css`
        --min-height: 4rem;
        --line-height: 2rem;
        --font-size: 1.7rem;
        --padding: 1rem;
        --border-size: 1px;
      `;
    }
    if (size === "large") {
      return css`
        --min-height: 6rem;
        --line-height: 3rem;
        --font-size: 2.5rem;
        --padding: 1.5rem 2rem;
        --border-size: 1px;
      `;
    }

    return css`
      --min-height: 4rem;
      --line-height: 2rem;
      --font-size: 1.7rem;
      --padding: 1rem;
      --border-size: 1px;
    `;
  }};
  ${({ kind }: Props) => {
    if (kind === "primary") {
      return css`
        --color: white;
        --color-hover: #eee;
        --color-active: #ccc;
        --background: #00f;
        --background-hover: #0a0;
        --background-active: grey;
        --border-color: #009;
        --border-color-hover: #090;
        --border-color-active: grey;
      `;
    }
  }}
  ${({ kind }: Props) => {
    if (kind === "link") {
      return css`
        --color: black;
        --color-hover: #333;
        --color-active: #666;
        --background: transparent;
        --background-hover: transparent;
        --background-active: transparent;
        --border-color: transparent;
        --border-color-hover: transparent;
        --border-color-active: transparent;
        --padding: 0 0;
        --border-size: 0;
        --min-height: 0;
      `;
    }
  }}
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  & > * {
    margin-right: 1rem;
  }

  & > *:last-child {
    margin-right: 0rem;
  }

  cursor: pointer;
  margin: 0;
  border-radius: 0.25rem;
  border: var(--border-size) solid var(--border-color);

  min-height: var(--min-height);
  line-height: var(--line-height);
  font-size: var(--font-size);
  padding: var(--padding);
  color: var(--color);
  background: var(--background);

  &:hover {
    color: var(--color-hover);
    background: var(--background-hover);
    border: var(--border-size) solid var(--border-color-hover);
  }
  &:active {
    color: var(--color-active);
    background: var(--background-active);
    border: var(--border-size) solid var(--border-color-active);
  }
`;

export default ({
  as,
  className,
  children,
  prefix,
  suffix,
  kind,
  size,
  onClick
}: Props) => (
  <StyledButton
    as={as}
    className={className}
    kind={kind}
    size={size}
    onClick={onClick}
  >
    {prefix && <Item>{prefix}</Item>}
    {children && <Item>{children}</Item>}
    {suffix && <Item>{suffix}</Item>}
  </StyledButton>
);
