import { Component } from "./component";
import { render } from "../html";
import { isBrowser } from "./env";

export type FunctionalComponent = () => unknown;

export const __FucoRegistry__: { [name: string]: FunctionalComponent } = {};

export function defineElement(name: string, fn: FunctionalComponent) {
  if (isBrowser) {
    customElements.define(
      name,
      class extends Component {
        renderer(container: Node) {
          render(fn(), container);
        }
      }
    );
  } else {
    __FucoRegistry__[name] = fn;
  }
}
