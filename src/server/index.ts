import { stringify } from "./stringify";

export function renderToString(value: unknown) {
  return stringify(1, [0, value]);
}
