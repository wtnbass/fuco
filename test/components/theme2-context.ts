import { createContext } from "../../src";

export type Theme2 = "green" | "red";

export const Theme2Context = createContext<Theme2>();

Theme2Context.defineProvider("theme2-context");
