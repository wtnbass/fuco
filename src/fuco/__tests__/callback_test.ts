import { expect } from "chai";
import { withFixtures, selector, selectorAll, text } from "./fixture";
import { html, useState, useCallback } from "..";

let updateCounts = [0, 0];

describe(
  "use-cllback",
  withFixtures(() => {
    const [count, setCount] = useState(0);
    const add = useCallback(() => {
      updateCounts[0]++;
      setCount((c) => c + 1);
    }, [count]);
    const minus = useCallback(() => {
      updateCounts[1]++;
      setCount((c) => c - 1);
    }, []);
    return html`
      <div>${count}</div>
      <button @click=${add}>Add</button>
      <button @click=${minus}>Minus</button>
    `;
  })(([f]) => {
    let target: Element;
    let add: HTMLButtonElement;
    let minus: HTMLButtonElement;
    let div: HTMLDivElement;

    const setup = async () => {
      target = await f.setup();
      [add, minus] = selectorAll<HTMLButtonElement>("button", target);
      div = selector("div", target);
    };

    beforeEach(() => {
      updateCounts = [0, 0];
    });

    it("mount", async () => {
      await setup();
      expect(text(div)).to.equal("0");
      expect(updateCounts).to.deep.equal([0, 0]);

      add.click();

      await setup();
      expect(text(div)).to.equal("1");
      expect(updateCounts).to.deep.equal([1, 0]);
    });

    it("callback has watched fields", async () => {
      await setup();
      expect(updateCounts).to.deep.equal([0, 0]);

      add.click();

      await setup();
      expect(text(div)).to.equal("1");
      expect(updateCounts).to.deep.equal([1, 0]);
    });

    it("callback doesn't have watched fields", async () => {
      await setup();
      expect(updateCounts).to.deep.equal([0, 0]);

      minus.click();

      await setup();
      expect(text(div)).to.equal("-1");
      expect(updateCounts).to.deep.equal([0, 1]);
    });
  })
);
