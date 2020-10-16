import { CssTemplate } from "./interfaces";

import "./global";

export function css(
  strings: TemplateStringsArray,
  ...values: unknown[]
): CssTemplate {
  return {
    [$fucoGlobal.__CssTemplate]: strings
      .slice(1)
      .reduce((acc, s, i) => acc + resolve(values[i]) + s, strings[0]),
  };
}

export function unsafeCSS(css: string): CssTemplate {
  return {
    [$fucoGlobal.__CssTemplate]: css,
  };
}

export const getCssString = (css: CssTemplate) =>
  css[$fucoGlobal.__CssTemplate];

export const isCss = (value: unknown): value is CssTemplate => {
  return value && getCssString(value as CssTemplate) != null;
};

const resolve = (value: unknown): string => {
  if (typeof value === "number") return String(value);
  if (isCss(value)) return getCssString(value);
  throw new TypeError(`${value} is not supported type.`);
};
