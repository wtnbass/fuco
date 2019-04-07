import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import "./components/counter-app";

describe("use-state", () => {
  let count: Element;
  let increment: HTMLButtonElement;
  let decrement: HTMLButtonElement;

  const setup = () => {
    const target = selectFixture("counter-app");
    const inner = target.shadowRoot;
    count = inner.querySelector("div");
    [increment, decrement] = inner.querySelectorAll("button");
  };

  beforeEach(() => {
    mountFixture(`
      <counter-app></counter-app>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    setup();
    expect(count.textContent).toEqual("0");
  });

  it("push increment", async () => {
    setup();
    increment.click();

    await waitFor();
    setup();
    expect(count.textContent).toEqual("1");
  });

  it("push decrement", async () => {
    setup();
    decrement.click();

    await waitFor();
    setup();
    expect(count.textContent).toEqual("-1");
  });
});
