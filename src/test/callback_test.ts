import {
  mountFixture,
  unmountFixture,
  selectFixture,
  selector,
  selectorAll,
  text,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useState, useCallback } from "..";

describe("use-cllback", () => {
  let target: Element;
  let add: HTMLButtonElement;
  let minus: HTMLButtonElement;
  let div: HTMLDivElement;
  let updateCounts = [0, 0];

  const setup = async () => {
    await waitFor();
    target = selectFixture("callback-test");
    [add, minus] = selectorAll<HTMLButtonElement>("button", target);
    div = selector("div", target);
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
    await setup();
    expect(text(div)).toEqual("0");
    expect(updateCounts).toEqual([0, 0]);

    add.click();

    await setup();
    expect(text(div)).toEqual("1");
    expect(updateCounts).toEqual([1, 0]);
  });

  it("callback has watched fields", async () => {
    await setup();
    expect(updateCounts).toEqual([0, 0]);

    add.click();

    await setup();
    expect(text(div)).toEqual("1");
    expect(updateCounts).toEqual([1, 0]);
  });

  it("callback doesn't have watched fields", async () => {
    await setup();
    expect(updateCounts).toEqual([0, 0]);

    minus.click();

    await setup();
    expect(text(div)).toEqual("-1");
    expect(updateCounts).toEqual([0, 1]);
  });
});
