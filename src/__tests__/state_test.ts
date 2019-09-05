/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { withFixtures, selector, selectorAll, text } from "./fixture";
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

const lazyInitialState = () => {
  const [state] = useState(() => "it's lazy.");
  return html`
    <div>${state}</div>
  `;
};

const fixtureNumber = () => {
  const [, setNum] = useState(+0);
  const updateCount = useRef(0);
  return html`
    <div>${updateCount.current!++}</div>
    <button @click=${() => setNum(-0)}></button>
    <button @click=${() => setNum(NaN)}></button>
    <button @click=${() => setNum(Number("a"))}></button>
  `;
};

describe(
  "use-state",
  withFixtures(fixture, lazyInitialState, fixtureNumber)(([f, f2, f3]) => {
    let count: HTMLDivElement;
    let updated: HTMLDivElement;
    let increment: HTMLButtonElement;
    let decrement: HTMLButtonElement;
    let equal: HTMLButtonElement;
    let buttons: HTMLButtonElement[];

    const setup = async () => {
      const target = await f.setup();
      [count, updated] = selectorAll<HTMLDivElement>("div", target);
      [increment, decrement, equal] = selectorAll<HTMLButtonElement>(
        "button",
        target
      );
    };

    const setup2 = async () => {
      const target = await f2.setup();
      count = selector("div", target);
    };

    const setup3 = async () => {
      const target = await f3.setup();
      updated = selector("div", target);
      buttons = [...selectorAll<HTMLButtonElement>("button", target)];
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

    it("lazy initial state", async () => {
      await setup2();
      expect(text(count)).toEqual("it's lazy.");
    });

    it("compare as SameValue", async () => {
      await setup3();
      expect(text(updated)).toEqual("0");

      // +0 => -0
      buttons[0].click();

      await setup3();
      expect(text(updated)).toEqual("1");

      buttons[1].click();

      await setup3();
      expect(text(updated)).toEqual("2");

      // NaN => NaN
      buttons[2].click();

      await setup3();
      expect(text(updated)).toEqual("2");
    });
  })
);
