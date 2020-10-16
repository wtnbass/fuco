import { Component, FC } from "./interfaces";

const __CssTemplateSymbol = Symbol("css");
const __HtmlTemplateSymbol = Symbol("html");

export type FucoGlobal = {
  __currentComponent: Component;
  __currentCursor: number;
  __CssTemplate: typeof __CssTemplateSymbol;
  __HtmlTemplate: typeof __HtmlTemplateSymbol;
  __defs: { [componentName: string]: FC };
};

globalThis.$fucoGlobal = globalThis.$fucoGlobal || {
  __currentComponent: undefined as any,
  __currentCursor: 0,
  __CssTemplate: __CssTemplateSymbol,
  __HtmlTemplate: __HtmlTemplateSymbol,
  __defs: {},
};
