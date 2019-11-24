import { withFixtures } from "./fixture";
import { html, useAttribute, useProperty, useLayoutEffect } from "..";

let updateCount = 0;
let cleanupCount = 0;
let count2 = [0, 0];

const fixture = () => {
  const value = useAttribute("value");
  const otherValue = useAttribute("other-value");
  useLayoutEffect(() => {
    updateCount++;
    return () => {
      cleanupCount++;
    };
  }, [value]);

  useLayoutEffect(() => {
    count2[0]++;
    return () => count2[1]++;
  });
  return html`
    ${value} ${otherValue}
  `;
};

let countFNum = 0;
const fixtureNumber = () => {
  const num = useProperty("num");
  useLayoutEffect(() => {
    countFNum++;
  }, [num]);
  return html``;
};

describe(
  "use-layout-effect",
  withFixtures(
    fixture,
    fixtureNumber
  )(([f, fNum]) => {
    beforeEach(() => {
      updateCount = 0;
      cleanupCount = 0;
      count2 = [0, 0];
      countFNum = 0;
    });

    it("mount", async () => {
      await f.setup();
      expect(updateCount).toEqual(1);
    });

    it("unmount", async () => {
      await f.setup();
      f.unmount();
      expect(cleanupCount).toEqual(1);
    });

    it("update", async () => {
      const target = await f.setup();
      expect(updateCount).toEqual(1);

      target.setAttribute("value", "change");

      await f.setup();
      expect(cleanupCount).toEqual(1);
      expect(updateCount).toEqual(2);
    });

    it("no update", async () => {
      const target = await f.setup();
      expect(updateCount).toEqual(1);

      target.setAttribute("other-value", "change");

      await f.setup();
      expect(cleanupCount).toEqual(0);
      expect(updateCount).toEqual(1);
    });

    it("cleanup works well", async () => {
      await f.setup();
      expect(updateCount).toEqual(1);
      expect(cleanupCount).toEqual(0);

      f.unmount();

      await f.setup();
      expect(updateCount).toEqual(1);
      expect(cleanupCount).toEqual(1);

      f.mount();

      await f.setup();
      expect(updateCount).toEqual(2);
      expect(cleanupCount).toEqual(1);
    });

    it("run every update time", async () => {
      const target = await f.setup();
      expect(count2).toEqual([1, 0]);

      target.setAttribute("value", "change");

      await f.setup();
      expect(count2).toEqual([2, 1]);

      target.setAttribute("other-value", "change");

      await f.setup();
      expect(count2).toEqual([3, 2]);
    });

    it("compare deps as SameValue", async () => {
      let target!: Element & { num: number };
      const setup = async () => {
        target = (await fNum.setup()) as Element & { num: number };
      };
      await setup();
      expect(countFNum).toEqual(1);

      target.num = +0;
      await setup();
      expect(countFNum).toEqual(2);

      target.num = -0;
      await setup();
      expect(countFNum).toEqual(3);

      target.num = NaN;
      await setup();
      expect(countFNum).toEqual(4);

      target.num = Number("a");
      await setup();
      expect(countFNum).toEqual(4);
    });
  })
);
