export { html } from "lit-html";
import { render, TemplateResult } from "lit-html";
import { Component, ComponentClass } from "./component";
export { useState, useProperty, useEffect } from "./hooks";

type FunctionalComponent = () => TemplateResult;

export const defineElement = (name: string, func: FunctionalComponent) =>
  component(name)(func);

export const component = (name: string) => (
  func: FunctionalComponent
): ComponentClass => {
  let element = class extends Component {
    static initialize() {
      func();
    }
    render() {
      render(func(), this.shadowRoot!);
    }
  };
  customElements.define(name, element);
  return element;
};
