/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { withFixtures, createFixture } from "./fixture";
import { html, css, unsafeCSS, useStyle } from "..";

const fontSize = (size: unknown) => () => css`
  div {
    font-size: ${size}px;
  }
`;

const sanitizeCss = (css: string) => css.replace(/\s+/g, " ").trim();

const getCssText = (element: Element) => {
  let css;
  if ("adoptedStyleSheets" in element.shadowRoot!) {
    css = element.shadowRoot!.adoptedStyleSheets[0].cssRules[0].cssText;
  } else {
    css = element.shadowRoot!.querySelector("style")!.textContent;
  }
  return sanitizeCss(css || "");
};

describe(
  "use-style",
  withFixtures(
    () => (useStyle(fontSize(10)), html``),
    () => (useStyle(fontSize(css`10`)), html``),
    () => (useStyle(fontSize(unsafeCSS("10"))), html``),
    () => {
      useStyle(
        () => css`
          @import url(https://unpkg.com/normalize.css);
        `
      );
      return html``;
    },
    () => {
      useStyle(
        () => css`
          @import url(${new URL("./normalize.css", "https://unpkg.com")});
        `
      );
      return html``;
    },
    () => {
      useStyle(fontSize(10)());
      return html``;
    }
  )(fs => {
    it("number value", async () => {
      const target = await fs[0].setup();
      expect(getCssText(target)).toEqual("div { font-size: 10px; }");
    });

    it("css value", async () => {
      const target = await fs[1].setup();
      expect(getCssText(target)).toEqual("div { font-size: 10px; }");
    });

    it("unsafe css", async () => {
      const target = await fs[2].setup();
      expect(getCssText(target)).toEqual("div { font-size: 10px; }");
    });

    it("import style", async () => {
      const target = await fs[3].setup();
      expect(getCssText(target)).not.toEqual("");
    });

    it("import using url value", async () => {
      const target = await fs[4].setup();
      expect(getCssText(target)).not.toEqual("");
    });

    it("disallow-type", async () => {
      let error: unknown = null;
      const f = createFixture(() => {
        useStyle(() => {
          try {
            return fontSize("10")();
          } catch (e) {
            error = e;
            return css``;
          }
        });
        return html``;
      });
      f.define();
      f.mount();
      await f.setup();

      expect(error).not.toBeNull();
    });

    it("allows css tag as argument", async () => {
      const target = await fs[5].setup();
      expect(getCssText(target)).toEqual("div { font-size: 10px; }");
    });
  })
);
