import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import "./components/hello-world";

describe("use-attribute", () => {
  let target: Element;
  let div: HTMLDivElement;

  const setup = () => {
    target = selectFixture("hello-world");
    div = target.shadowRoot.querySelector("div");
  };

  beforeEach(() => {
    mountFixture(`
      <hello-world name="World"></hello-world>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    setup();
    expect(target.getAttribute("name")).toEqual("World");
    expect(div.textContent).toEqual("Hello, World");
  });

  it("attribute changed", async () => {
    setup();
    target.setAttribute("name", "useAttribute");

    await waitFor();
    setup();
    expect(target.getAttribute("name")).toEqual("useAttribute");
    expect(div.textContent).toEqual("Hello, useAttribute");
  });
});
