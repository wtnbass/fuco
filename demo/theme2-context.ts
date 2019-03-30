import { createContext, defineElement } from "./lib";

export type Theme2 = "green" | "red";

export const Theme2Context = createContext<Theme2>();

defineElement("theme2-context", Theme2Context.Provider);
