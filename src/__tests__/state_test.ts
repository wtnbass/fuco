/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { withFixtures, selectorAll, text } from "./fixture";
import { html, useState, useRef } from "..";

const fixture = () => {
  const [count, setCount] = useState(0);
  const updateCount = useRef(0);
  return html`
    <div>${count}</div>
    <div>${updateCount.current!++}</div>
    <button @click=${() => setCount(count + 1)}>+</button>
    <button @click=${() => setCount(count - 1)}>-</button>
    <button @click=${() => setCount(count)}>=</button>
  `;
};

describe(
  "use-state",
  withFixtures(fixture)(([f]) => {
    let count: HTMLDivElement;
    let updated: HTMLDivElement;
    let increment: HTMLButtonElement;
    let decrement: HTMLButtonElement;
    let equal: HTMLButtonElement;

    const setup = async () => {
      const target = await f.setup();
      [count, updated] = selectorAll<HTMLDivElement>("div", target);
      [increment, decrement, equal] = selectorAll<HTMLButtonElement>(
        "button",
        target
      );
    };

    it("mount", async () => {
      await setup();
      expect(text(count)).toEqual("0");
      expect(text(updated)).toEqual("0");

      increment.click();

      await setup();
      expect(text(count)).toEqual("1");
      expect(text(updated)).toEqual("1");

      equal.click();

      await setup();
      expect(text(count)).toEqual("1");
      expect(text(updated)).toEqual("1");

      decrement.click();

      await setup();
      expect(text(count)).toEqual("0");
      expect(text(updated)).toEqual("2");
    });
  })
);
