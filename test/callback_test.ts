import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useState, useCallback } from "../src";

describe("use-cllback", () => {
  let target: Element;
  let add: HTMLButtonElement;
  let minus: HTMLButtonElement;
  let div: HTMLDivElement;
  let updateCounts = [0, 0];

  const setup = () => {
    target = selectFixture("callback-test");
    [add, minus] = target.shadowRoot.querySelectorAll("button");
    div = target.shadowRoot.querySelector("div");
  };

  beforeAll(() => {
    defineElement("callback-test", () => {
      const [count, setCount] = useState(0);
      const add = useCallback(() => {
        updateCounts[0]++;
        setCount(c => c + 1);
      }, [count]);
      const minus = useCallback(() => {
        updateCounts[1]++;
        setCount(c => c - 1);
      });
      return html`
        <div>${count}</div>
        <button @click=${add}>Add</button>
        <button @click=${minus}>Minus</button>
      `;
    });
  });

  beforeEach(() => {
    updateCounts = [0, 0];
    mountFixture(`
      <callback-test></callback-test>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    setup();
    expect(div.textContent.trim()).toEqual("0");
    expect(updateCounts).toEqual([0, 0]);

    add.click();
    await waitFor();

    expect(div.textContent.trim()).toEqual("1");
    expect(updateCounts).toEqual([1, 0]);
  });

  it("callback has watched fields", async () => {
    setup();
    expect(updateCounts).toEqual([0, 0]);

    add.click();
    await waitFor();

    expect(div.textContent.trim()).toEqual("1");
    expect(updateCounts).toEqual([1, 0]);
  });

  it("callback doesn't have watched fields", async () => {
    setup();
    expect(updateCounts).toEqual([0, 0]);

    minus.click();
    await waitFor();

    expect(div.textContent.trim()).toEqual("-1");
    expect(updateCounts).toEqual([0, 1]);
  });
});
