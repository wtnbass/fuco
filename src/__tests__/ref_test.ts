import { expect } from "chai";
import { withFixtures, selector, text } from "./fixture";
import { html, useRef, useState, useEffect } from "../fuco";

const fixture = () => {
  const [value, set] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevRef = useRef<string>(null);
  useEffect(() => {
    prevRef.current = value;
  }, [value]);
  const prevValue = prevRef.current;

  return html`
    <input type="text" id="input" :ref=${inputRef} />
    <button @click=${() => set(inputRef.current!.value)}>push</button>
    <div id="value">${value}</div>
    <div id="prev-value">${prevValue}</div>
  `;
};

describe(
  "use-ref",
  withFixtures(fixture)(([f]) => {
    let target: Element;
    let input: HTMLInputElement;
    let button: HTMLButtonElement;
    let valueDiv: HTMLDivElement;
    let prevValueDiv: HTMLDivElement;

    const setup = async () => {
      target = await f.setup();
      input = selector("input", target);
      button = selector("button", target);
      valueDiv = selector("#value", target);
      prevValueDiv = selector("#prev-value", target);
    };

    it("mount", async () => {
      await setup();
      expect(input.value).to.equal("");
      expect(text(valueDiv)).to.equal("");
      expect(text(prevValueDiv)).to.equal("");

      input.value = "one";
      button.click();

      await setup();
      expect(input.value).to.equal("one");
      expect(text(valueDiv)).to.equal("one");
      expect(text(prevValueDiv)).to.equal("");

      input.value = "two";
      button.click();

      await setup();
      expect(input.value).to.equal("two");
      expect(text(valueDiv)).to.equal("two");
      expect(text(prevValueDiv)).to.equal("one");
    });
  })
);
