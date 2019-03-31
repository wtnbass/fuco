import { createContext, defineElement } from "../lib";

export type Theme = "light" | "dark";

export const ThemeContext = createContext<Theme>();

defineElement("theme-context", ThemeContext.Provider);
