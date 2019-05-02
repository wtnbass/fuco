import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useProperty } from "../src";

describe("use-attribute", () => {
  let target: Element;
  let div: HTMLDivElement;

  const setup = async () => {
    await waitFor();
    target = selectFixture("hello-world");
    div = target.shadowRoot.querySelector("div");
  };

  beforeAll(() => {
    defineElement("hello-world", () => {
      const name = useProperty("greet-name");
      return html`
        <div>Hello, ${name}</div>
      `;
    });
  });

  beforeEach(() => {
    mountFixture(`
      <hello-world greet-name="World"></hello-world>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    await setup();
    expect(target.getAttribute("greet-name")).toEqual("World");
    expect(div.textContent).toEqual("Hello, World");
  });

  it("attribute changed", async () => {
    await setup();
    target.setAttribute("greet-name", "property");

    await setup();
    expect(target.getAttribute("greet-name")).toEqual("property");
    expect(div.textContent).toEqual("Hello, property");
  });
});
