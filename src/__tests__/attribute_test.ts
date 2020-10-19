import { expect } from "chai";
import { withFixtures, selector, text, selectorAll } from "./fixture";
import { html, useAttribute, useRef } from "../fuco";

const fixture = () => {
  const name = useAttribute("greet-name");
  const updateCount = useRef(0);
  return html`
    <div>${name}</div>
    <div>${updateCount.current!++}</div>
  `;
};

const fixturewithConvert = () => {
  const user = useAttribute<{ name: string; age: number }>("user", (json) => {
    if (!json) return {};
    return JSON.parse(json);
  });
  return html` <div>${user.name} (${user.age})</div> `;
};

const fixtureBooleanAttribute = () => {
  const checked = useAttribute("checked", (value) => value != null);
  return html` <div>${String(checked)}</div> `;
};

const fixtureNumberAttribute = () => {
  const num = useAttribute("number", Number);
  const updateCount = useRef(0);
  return html`
    <div>${num}</div>
    <div>${updateCount.current!++}</div>
  `;
};

describe(
  "use-attribute",
  withFixtures(
    fixture,
    fixturewithConvert,
    fixtureBooleanAttribute,
    fixtureNumberAttribute
  )((fs) => {
    it("row attribute", async () => {
      let target!: Element;
      let div!: HTMLDivElement;
      let count!: HTMLDivElement;
      const setup = async () => {
        target = await fs[0].setup();
        [div, count] = selectorAll<HTMLDivElement>("div", target);
      };

      await setup();
      expect(target.getAttribute("greet-name")).to.be.null;
      expect(text(div)).to.equal("");
      expect(text(count)).to.equal("0");

      // change
      target.setAttribute("greet-name", "property");

      await setup();
      expect(target.getAttribute("greet-name")).to.equal("property");
      expect(div.textContent).to.equal("property");
      expect(text(count)).to.equal("1");

      // same change
      target.setAttribute("greet-name", "property");

      await setup();
      expect(text(count)).to.equal("1");
    });

    it("with converter", async () => {
      let target!: Element;
      let div!: HTMLDivElement;
      const setup = async () => {
        target = await fs[1].setup();
        div = selector("div", target);
      };

      await setup();

      const value = JSON.stringify({ name: "Keisuke", age: 28 });
      target.setAttribute("user", value);

      await setup();
      expect(target.getAttribute("user")).to.equal(value);
      expect(text(div)).to.equal("Keisuke (28)");
    });

    it("boolean attribute", async () => {
      let target!: Element;
      let div!: HTMLDivElement;
      const setup = async () => {
        target = await fs[2].setup();
        div = selector("div", target);
      };

      await setup();

      target.setAttribute("checked", "");

      await setup();
      expect(text(div)).to.equal("true");

      target.removeAttribute("checked");

      await setup();
      expect(text(div)).to.equal("false");
    });

    it("compare as SameValue", async () => {
      let target!: Element;
      let count!: HTMLDivElement;
      const setup = async () => {
        target = await fs[3].setup();
        [, count] = selectorAll<HTMLDivElement>("div", target);
      };

      await setup();
      expect(target.getAttribute("number")).to.be.null;
      expect(text(count)).to.equal("0");

      target.setAttribute("number", "+0");

      await setup();
      expect(target.getAttribute("number")).to.equal("+0");
      expect(text(count)).to.equal("0");

      // +0 => -0
      target.setAttribute("number", "-0");

      await setup();
      expect(target.getAttribute("number")).to.equal("-0");
      expect(text(count)).to.equal("1");

      target.setAttribute("number", "aaa");

      await setup();
      expect(target.getAttribute("number")).to.equal("aaa");
      expect(text(count)).to.equal("2");

      // NaN => NaN
      target.setAttribute("number", "bbb");

      await setup();
      expect(target.getAttribute("number")).to.equal("bbb");
      expect(text(count)).to.equal("2");
    });
  })
);
