/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "chai";
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
      useStyle(fontSize(10)());
      return html``;
    }
  )((fs) => {
    it("number value", async () => {
      const target = await fs[0].setup();
      expect(getCssText(target)).to.equal("div { font-size: 10px; }");
    });

    it("css value", async () => {
      const target = await fs[1].setup();
      expect(getCssText(target)).to.equal("div { font-size: 10px; }");
    });

    it("unsafe css", async () => {
      const target = await fs[2].setup();
      expect(getCssText(target)).to.equal("div { font-size: 10px; }");
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

      expect(error).not.to.be.null;
    });

    it("allows css tag as argument", async () => {
      const target = await fs[3].setup();
      expect(getCssText(target)).to.equal("div { font-size: 10px; }");
    });
  })
);
