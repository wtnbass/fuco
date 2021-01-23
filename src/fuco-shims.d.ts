import { FucoGlobal } from "./global";

declare global {
  export var $fucoGlobal: FucoGlobal;

  interface ShadowRoot {
    adoptedStyleSheets: CSSStyleSheet[];
  }

  interface CSSStyleSheet {
    replace(css: string): Promise<unknown>;
    replaceSync(css: string): void;
  }
}
