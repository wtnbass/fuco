import { withFixture, selector, waitFor } from "./fixture";
import { html, useAttribute } from "..";

const fixture = () => {
  const name = useAttribute("greet-name");
  return html`
    <div>Hello, ${name}</div>
  `;
};

describe(
  "use-attribute",
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
