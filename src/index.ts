import { render, TemplateResult } from "lit-html";
import { Component } from "./core";

export { html } from "lit-html";
export * from "./core";

export interface FunctionalComponent {
  (): TemplateResult;
}

export function defineElement(name: string, fn: FunctionalComponent) {
  window.customElements.define(
    name,
    class extends Component {
      public render() {
        render(fn(), this.$root, { eventContext: this });
      }
    }
  );
}
