interface ShadowRoot {
  adoptedStyleSheets: CSSStyleSheet[];
}

interface CSSStyleSheet {
  replaceSync(css: string): void;
}
