import { Component, render } from "./core";

export * from "./core";

export interface FunctionalComponent {
  (): unknown;
}

export function defineElement(name: string, fn: FunctionalComponent) {
  window.customElements.define(
    name,
    class extends Component {
      protected render() {
        render(fn(), this.$root);
      }
    }
  );
}
