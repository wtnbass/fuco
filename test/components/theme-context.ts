import { createContext, defineElement } from "../../src";

export type Theme = "light" | "dark";

export const ThemeContext = createContext<Theme>();

defineElement("theme-context", ThemeContext.Provider);
