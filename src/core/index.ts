export { html, render } from "../html";
export { Component, FunctionalComponent, makeDifine } from "./component";
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
  useLayoutEffect,
  useMemo,
  useCallback
} from "./hooks";

import { render } from "../html";
import { makeDifine } from "./component";
export const defineElement = makeDifine((fn, c) => render(fn(), c.$root));
