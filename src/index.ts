import { render, TemplateResult } from "lit-html";
import { Component } from "./component";

export { html } from "lit-html";
export { createContext } from "./context";
export {
  useAttribute,
  useProperty,
  useDispatchEvent,
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

export interface DefineElementOptions {
  lightDOM: boolean;
}

const defaultOptions: DefineElementOptions = {
  lightDOM: false
};

export function defineElement(
  name: string,
  func: () => TemplateResult,
  options: DefineElementOptions = defaultOptions
) {
  window.customElements.define(
    name,
    class extends Component {
      public rootElement = options.lightDOM
        ? this
        : this.attachShadow({ mode: "open" });

      protected callFunction() {
        render(func(), this.rootElement);
      }
    }
  );
}
