import { withFixture, selector, text, waitFor } from "./fixture";
import { html, useAttribute } from "..";

const fixture = () => {
  const name = useAttribute("greet-name");
  return html`
    <div>Hello, ${name}</div>
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

describe("use-attribute", () => {
  describe(
    "raw attribute",
    withFixture(fixture, name => {
      let target: Element;
      let div: HTMLDivElement;

      const setup = async () => {
        await waitFor();
        target = selector(name);
        div = selector("div", target);
      };

      it("mount", async () => {
        await setup();
        expect(target.getAttribute("greet-name")).toBeNull();
        expect(div.textContent).toEqual("Hello, ");
      });

      it("attribute changed", async () => {
        await setup();
        target.setAttribute("greet-name", "property");

        await setup();
        expect(target.getAttribute("greet-name")).toEqual("property");
        expect(div.textContent).toEqual("Hello, property");
      });
    })
  );

  describe(
    "with converter",
    withFixture(fixturewithConvert, elementName => {
      let target: Element;
      let div: HTMLDivElement;

      const setup = async () => {
        await waitFor();
        target = selector(elementName);
        div = selector("div", target);
      };

      it("mount", async () => {
        await setup();
        const value = JSON.stringify({ name: "Keisuke", age: 28 });

        target.setAttribute("user", value);

        await setup();
        expect(target.getAttribute("user")).toEqual(value);
        expect(text(div)).toEqual("Keisuke (28)");
      });
    })
  );

  describe(
    "boolean attribute",
    withFixture(fixtureBooleanAttribute, elementName => {
      let target: Element;
      let div: HTMLDivElement;

      const setup = async () => {
        await waitFor();
        target = selector(elementName);
        div = selector("div", target);
      };

      it("mount", async () => {
        await setup();

        target.setAttribute("checked", "");
        await setup();
        expect(text(div)).toEqual("true");

        target.removeAttribute("checked");
        await setup();
        expect(text(div)).toEqual("false");
      });
    })
  );
});
