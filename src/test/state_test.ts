import {
  mountFixture,
  unmountFixture,
  selectFixture,
  selector,
  selectorAll,
  text,
  waitFor
} from "./helpers/fixture";

import { html, defineElement, useState } from "..";

describe("use-state", () => {
  let count: Element;
  let increment: HTMLButtonElement;
  let decrement: HTMLButtonElement;

  const setup = async () => {
    await waitFor();
    const target = selectFixture("counter-app");
    count = selector("div", target);
    [increment, decrement] = selectorAll<HTMLButtonElement>("button", target);
  };

  beforeAll(() => {
    defineElement("counter-app", () => {
      const [count, setCount] = useState(0);
      return html`
        <div>${count}</div>
        <button @click=${() => setCount(count + 1)}>+</button>
        <button @click=${() => setCount(count - 1)}>-</button>
      `;
    });
  });

  beforeEach(() => {
    mountFixture(`
      <counter-app></counter-app>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    await setup();
    expect(text(count)).toEqual("0");
  });

  it("push increment", async () => {
    await setup();
    increment.click();

    await setup();
    expect(text(count)).toEqual("1");
  });

  it("push decrement", async () => {
    await setup();
    decrement.click();

    await setup();
    expect(text(count)).toEqual("-1");
  });
});
