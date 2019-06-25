import { Component, FunctionalComponent } from "./component";

export { html } from "lit-html";
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

export function defineElement(name: string, fn: FunctionalComponent) {
  window.customElements.define(
    name,
    class extends Component {
      protected static functionalComponent = fn;
    }
  );
}
