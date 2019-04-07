import { createContext, defineElement } from "../../src";

export type Theme2 = "green" | "red";

export const Theme2Context = createContext<Theme2>();

defineElement("theme2-context", Theme2Context.Provider);
