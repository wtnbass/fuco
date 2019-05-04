import { withFixture, selector, text, waitFor } from "./fixture";
import { html, useState, useCallback } from "..";

const fixture = () => {
  const [count, setCount] = useState(0);
  const million = useCallback(() => {
    for (let i = 0; i < 1000000; i++) {
      setCount(c => c + 1);
    }
  });
  return html`
    <div>${count}</div>
    <button @click=${million}>+1000000</button>
  `;
};

describe(
  "million update",
  withFixture(fixture, name => {
    let target: Element;
    let button: HTMLButtonElement;
    let div: HTMLDivElement;

    const setup = async () => {
      await waitFor();
      target = selector(name);
      div = selector("div", target);
      button = selector("button", target);
    };

    it("million update", async () => {
      await setup();
      expect(text(div)).toEqual("0");

      button.click();

      await setup();
      expect(text(div)).toEqual("1000000");
    });
  })
);
