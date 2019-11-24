import { stringify } from "./stringify";

export function renderToString(template: unknown) {
  return stringify(1, [0, template]);
}
