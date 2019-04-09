import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useState, useCallback } from "../src";

describe("million update", () => {
  let target: Element;
  let button: HTMLButtonElement;
  let div: HTMLDivElement;
  let timeout: number;

  const setup = async () => {
    await waitFor();
    target = selectFixture("million-count");
    div = target.shadowRoot.querySelector("div");
    button = target.shadowRoot.querySelector("button");
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
    timeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
    mountFixture(`
      <million-count></million-count>
    `);
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;
    unmountFixture();
  });

  it("million update", async () => {
    await setup();
    expect(div.textContent.trim()).toEqual("0");

    button.click();

    await setup();
    expect(div.textContent.trim()).toEqual("1000000");
  });
});
