import { render, TemplateResult } from "lit-html";
import { Component, ComponentClass } from "./component";

export { html } from "lit-html";
export { Context, createContext } from "./context";
export {
  useAttribute,
  useProperty,
  useState,
  useReducer,
  useContext,
  useEffect,
  useMemo,
  useCallback
} from "./hooks";

type FunctionalComponent = () => TemplateResult;

export function defineElement(
  name: string,
  func: FunctionalComponent
): ComponentClass {
  let C = class extends Component {
    protected static initialize() {
      func();
    }
    protected render() {
      render(func(), this.rootElement);
    }
  };
  window.customElements.define(name, C);
  return C;
}

export const component = (name: string) => (
  func: FunctionalComponent
): ComponentClass => defineElement(name, func);
