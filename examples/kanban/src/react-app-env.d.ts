/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PUBLIC_URL: string;
  }
}

declare module "*.bmp" {
  const dist: string;
  export default dist;
}

declare module "*.gif" {
  const dist: string;
  export default dist;
}

declare module "*.jpg" {
  const dist: string;
  export default dist;
}

declare module "*.jpeg" {
  const dist: string;
  export default dist;
}

declare module "*.png" {
  const dist: string;
  export default dist;
}

declare module "*.webp" {
  const dist: string;
  export default dist;
}

declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;

  const dist: string;
  export default dist;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}
