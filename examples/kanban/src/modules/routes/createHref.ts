import { Location } from "./Link";

export function createHref(to: Location) {
  return typeof to === "string"
    ? to
    : [to.pathname, to.search, to.hash].filter(Boolean).join("");
}
