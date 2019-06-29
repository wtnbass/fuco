import { withFixtures, selector, selectorAll, text } from "./fixture";

import { html, useState } from "..";

const fixture = () => {
  const [count, setCount] = useState(0);
  return html`
    <div>${count}</div>
    <button @click=${() => setCount(count + 1)}>+</button>
    <button @click=${() => setCount(count - 1)}>-</button>
  `;
};

describe(
  "use-state",
  withFixtures(fixture)(([f]) => {
    let count: Element;
    let increment: HTMLButtonElement;
    let decrement: HTMLButtonElement;

    const setup = async () => {
      const target = await f.setup();
      count = selector("div", target);
      [increment, decrement] = selectorAll<HTMLButtonElement>("button", target);
    };

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
  })
);
