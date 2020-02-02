import { supportsAdoptedStyleSheets } from "./env";

const cssSymbol = Symbol("css");

export interface HasCSSSymbol {
  [cssSymbol]: string;
}

const hasCSSSymbol = (value: unknown): value is HasCSSSymbol => {
  return value && (value as HasCSSSymbol)[cssSymbol] != null;
};

const resolve = (value: unknown): string => {
  if (typeof value === "number") return String(value);
  if (hasCSSSymbol(value)) return value[cssSymbol];
  if (value instanceof URL) return value.href;
  throw new TypeError(`${value} is not supported type.`);
};

export const css = (strings: readonly string[], ...values: unknown[]) => ({
  [cssSymbol]: strings
    .slice(1)
    .reduce((acc, s, i) => acc + resolve(values[i]) + s, strings[0])
});

export const unsafeCSS = (css: string) => ({ [cssSymbol]: css });

export const adoptCssStyle = (root: ShadowRoot, css: HasCSSSymbol) => {
  const cssStyle = css[cssSymbol];
  if (supportsAdoptedStyleSheets) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replace(cssStyle);
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, styleSheet];
  } else {
    root.appendChild(document.createElement("style")).textContent = cssStyle;
  }
};

declare global {
  interface ShadowRoot {
    adoptedStyleSheets: CSSStyleSheet[];
  }

  interface CSSStyleSheet {
    replace(css: string): Promise<unknown>;
    replaceSync(css: string): void;
  }
}
