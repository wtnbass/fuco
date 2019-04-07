import { render, TemplateResult } from "lit-html";
import { Component } from "./component";

export { html } from "lit-html";
export { createContext } from "./context";
export {
  useAttribute,
  useProperty,
  useQuery,
  useQueryAll,
  useState,
  useReducer,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useErrorBoundary
} from "./hooks";

export type FunctionalComponent = () => TemplateResult;

export function defineElement(name: string, func: FunctionalComponent) {
  window.customElements.define(
    name,
    class extends Component {
      protected render() {
        render(func(), this.rootElement);
      }
    }
  );
}
