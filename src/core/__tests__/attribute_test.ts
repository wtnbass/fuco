/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { withFixtures, selector, text, selectorAll } from "./fixture";
import { html, useAttribute, useRef } from "..";

const fixture = () => {
  const name = useAttribute("greet-name");
  const updateCount = useRef(0);
  return html`
    <div>${name}</div>
    <div>${updateCount.current!++}</div>
  `;
};

const fixturewithConvert = () => {
  const user = useAttribute<{ name: string; age: number }>("user", json => {
    if (!json) return {};
    return JSON.parse(json);
  });
  return html`
    <div>
      ${user.name} (${user.age})
    </div>
  `;
};

const fixtureBooleanAttribute = () => {
  const checked = useAttribute("checked", value => value != null);
  return html`
    <div>${String(checked)}</div>
  `;
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
  )(fs => {
    it("row attribute", async () => {
      let target!: Element;
      let div!: HTMLDivElement;
      let count!: HTMLDivElement;
      const setup = async () => {
        target = await fs[0].setup();
        [div, count] = selectorAll<HTMLDivElement>("div", target);
      };

      await setup();
      expect(target.getAttribute("greet-name")).toBeNull();
      expect(text(div)).toEqual("");
      expect(text(count)).toEqual("0");

      // change
      target.setAttribute("greet-name", "property");

      await setup();
      expect(target.getAttribute("greet-name")).toEqual("property");
      expect(div.textContent).toEqual("property");
      expect(text(count)).toEqual("1");

      // same change
      target.setAttribute("greet-name", "property");

      await setup();
      expect(text(count)).toEqual("1");
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
      expect(target.getAttribute("user")).toEqual(value);
      expect(text(div)).toEqual("Keisuke (28)");
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
      expect(text(div)).toEqual("true");

      target.removeAttribute("checked");

      await setup();
      expect(text(div)).toEqual("false");
    });

    it("compare as SameValue", async () => {
      let target!: Element;
      let count!: HTMLDivElement;
      const setup = async () => {
        target = await fs[3].setup();
        [, count] = selectorAll<HTMLDivElement>("div", target);
      };

      await setup();
      expect(target.getAttribute("number")).toBeNull();
      expect(text(count)).toEqual("0");

      target.setAttribute("number", "+0");

      await setup();
      expect(target.getAttribute("number")).toEqual("+0");
      expect(text(count)).toEqual("0");

      // +0 => -0
      target.setAttribute("number", "-0");

      await setup();
      expect(target.getAttribute("number")).toEqual("-0");
      expect(text(count)).toEqual("1");

      target.setAttribute("number", "aaa");

      await setup();
      expect(target.getAttribute("number")).toEqual("aaa");
      expect(text(count)).toEqual("2");

      // NaN => NaN
      target.setAttribute("number", "bbb");

      await setup();
      expect(target.getAttribute("number")).toEqual("bbb");
      expect(text(count)).toEqual("2");
    });
  })
);
