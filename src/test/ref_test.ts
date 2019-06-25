/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { withFixture, selector, text, waitFor } from "./fixture";
import { html, useRef, useState, useEffect } from "..";

const fixture = () => {
  const [value, set] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevRef = useRef<string>(null);
  useEffect(() => {
    prevRef.current = value;
  }, [value]);
  const prevValue = prevRef.current;

  return html`
    <input type="text" id="input" ref=${inputRef} />
    <button @click=${() => set(inputRef.current!.value)}>push</button>
    <div id="value">${value}</div>
    <div id="prev-value">${prevValue}</div>
  `;
};

describe(
  "use-ref",
  withFixture(fixture, elName => {
    let target: Element;
    let input: HTMLInputElement;
    let button: HTMLButtonElement;
    let valueDiv: HTMLDivElement;
    let prevValueDiv: HTMLDivElement;

    const setup = async () => {
      await waitFor();
      target = selector(elName);
      input = selector("input", target);
      button = selector("button", target);
      valueDiv = selector("#value", target);
      prevValueDiv = selector("#prev-value", target);
    };

    it("mount", async () => {
      await setup();
      expect(input.value).toEqual("");
      expect(text(valueDiv)).toEqual("");
      expect(text(prevValueDiv)).toEqual("");

      input.value = "one";
      button.click();

      await setup();
      expect(input.value).toEqual("one");
      expect(text(valueDiv)).toEqual("one");
      expect(text(prevValueDiv)).toEqual("");

      input.value = "two";
      button.click();

      await setup();
      expect(input.value).toEqual("two");
      expect(text(valueDiv)).toEqual("two");
      expect(text(prevValueDiv)).toEqual("one");
    });
  })
);
