import { FucoGlobal } from "./global";

declare global {
  // eslint-disable-next-line no-var
  export var $fucoGlobal: FucoGlobal;

  interface ShadowRoot {
    adoptedStyleSheets: CSSStyleSheet[];
  }

  interface CSSStyleSheet {
    replace(css: string): Promise<unknown>;
    replaceSync(css: string): void;
  }
}
