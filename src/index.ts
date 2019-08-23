import { render, TemplateResult } from "lit-html";
import { Component } from "./component";

export { html } from "lit-html";
export { Component } from "./component";
export { css, unsafeCSS } from "./css";
export { createContext } from "./context";
export {
  useAttribute,
  useProperty,
  useDispatchEvent,
  useStyle,
  useRef,
  useState,
  useReducer,
  useContext,
  useEffect,
  useMemo,
  useCallback
} from "./hooks";

export interface FunctionalComponent {
  (): TemplateResult;
}

export function defineElement(name: string, fn: FunctionalComponent) {
  window.customElements.define(
    name,
    class extends Component {
      protected render() {
        render(fn(), this.$root, { eventContext: this });
      }
    }
  );
}
