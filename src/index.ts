import {
  defineElement,
  ComponentClass,
  FunctionalComponent
} from "./component";

export { html } from "lit-html";
export { defineElement, FunctionalComponent } from "./component";
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

export const component = (name: string) => (
  func: FunctionalComponent
): ComponentClass => defineElement(name, func);
