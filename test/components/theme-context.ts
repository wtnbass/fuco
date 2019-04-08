import { createContext } from "../../src";

export type Theme = "light" | "dark";

export const ThemeContext = createContext<Theme>();

ThemeContext.defineProvider("theme-context");
