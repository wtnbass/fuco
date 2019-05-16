/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { withFixture, waitFor, selector } from "./fixture";
import { html, css, unsafeCSS, useStyle } from "..";

const fontSize = (size: unknown) => css`
  div {
    font-size: ${size}px;
  }
`;

const fixtureNumber = () => {
  useStyle(fontSize(10));
  return html`
    <div>Test</div>
  `;
};

const fixtureAnotherCSS = () => {
  useStyle(fontSize(css`10`));
  return html`
    <div>Test</div>
  `;
};

const fixtureUnsafeCss = () => {
  useStyle(fontSize(unsafeCSS("10")));
  return html`
    <div>Test</div>
  `;
};

const fixtureImports = () => {
  useStyle(
    css`
      @import url(https://unpkg.com/normalize.css);
    `
  );
  return html``;
};

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

describe("use-style", () => {
  describe(
    "number value",
    withFixture(fixtureNumber, name => {
      let target: Element;
      const setup = async () => {
        await waitFor();
        target = selector(name);
      };

      it("size is 10", async () => {
        await setup();
        expect(getCssText(target)).toEqual("div { font-size: 10px; }");
      });
    })
  );

  describe(
    "css value",
    withFixture(fixtureAnotherCSS, name => {
      let target: Element;
      const setup = async () => {
        await waitFor();
        target = selector(name);
      };

      it("size is 10", async () => {
        await setup();
        expect(getCssText(target)).toEqual("div { font-size: 10px; }");
      });
    })
  );
  describe(
    "css value",
    withFixture(fixtureUnsafeCss, name => {
      let target: Element;
      const setup = async () => {
        await waitFor();
        target = selector(name);
      };

      it("size is 10", async () => {
        await setup();
        expect(getCssText(target)).toEqual("div { font-size: 10px; }");
      });
    })
  );
  describe(
    "import style",
    withFixture(fixtureImports, name => {
      let target: Element;
      const setup = async () => {
        await waitFor();
        target = selector(name);
      };

      it("suceeded import css", async () => {
        await setup();
        expect(getCssText(target)).not.toEqual("");
      });
    })
  );
  describe(
    "import using url value",
    withFixture(
      () => {
        useStyle(
          css`
            @import url(${new URL("./normalize.css", "https://unpkg.com")});
          `
        );
        return html``;
      },
      name => {
        let target: Element;
        const setup = async () => {
          await waitFor();
          target = selector(name);
        };
        it("suceeded import css", async () => {
          await setup();
          expect(getCssText(target)).not.toEqual("");
        });
      }
    )
  );
});
