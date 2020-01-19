export { html } from "../html";
import { rehydrateScript } from "./rehydrate";
import { stringify } from "./stringify";

export type Options = {
  hydrate: boolean;
};

export function renderToString(value: unknown, options?: Options) {
  let html = stringify(1, [0, value]);
  if (options?.hydrate) {
    html += rehydrateScript();
  }
  return html;
}
