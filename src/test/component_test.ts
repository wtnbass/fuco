import {
  mountFixture,
  unmountFixture,
  selectFixture,
  selector,
  text,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useState, useCallback } from "..";

describe("million update", () => {
  let target: Element;
  let button: HTMLButtonElement;
  let div: HTMLDivElement;

  const setup = async () => {
    await waitFor();
    target = selectFixture("million-count");
    div = selector("div", target);
    button = selector("button", target);
  };

  beforeAll(() => {
    defineElement("million-count", () => {
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
    });
  });

  beforeEach(() => {
    mountFixture(`
      <million-count></million-count>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("million update", async () => {
    await setup();
    expect(text(div)).toEqual("0");

    button.click();

    await setup();
    expect(text(div)).toEqual("1000000");
  });
});
