import { Component } from "./component";
import { render } from "../html";
import { isBrowser } from "./env";

export type FunctionalComponent = () => unknown;

export const Registry: { [name: string]: FunctionalComponent } = {};

export function defineElement(name: string, fn: FunctionalComponent) {
  if (isBrowser) {
    customElements.define(
      name,
      class extends Component {
        public render() {
          render(fn(), this.$root);
        }
      }
    );
  } else {
    Registry[name] = fn;
  }
}
