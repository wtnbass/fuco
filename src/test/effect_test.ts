import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useAttribute, useEffect } from "..";

describe("use-effect", () => {
  let updateCount = 0;
  let cleanupCount = 0;

  beforeAll(() => {
    defineElement("effect-test", () => {
      const value = useAttribute("value");
      const otherValue = useAttribute("other-value");
      useEffect(() => {
        updateCount++;
        return () => {
          cleanupCount++;
        };
      }, [value]);
      return html`
        ${value} ${otherValue}
      `;
    });
  });

  beforeEach(() => {
    updateCount = 0;
    cleanupCount = 0;
    mountFixture(`
      <effect-test></effect-test>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    await waitFor();
    expect(updateCount).toEqual(1);
  });

  it("unmount", async () => {
    await waitFor();
    unmountFixture();
    expect(cleanupCount).toEqual(1);
  });

  it("update", async () => {
    await waitFor();
    const target = selectFixture("effect-test");
    expect(updateCount).toEqual(1);

    target.setAttribute("value", "change");

    await waitFor();
    expect(cleanupCount).toEqual(1);
    expect(updateCount).toEqual(2);
  });

  it("no update", async () => {
    await waitFor();
    const target = selectFixture("effect-test");
    expect(updateCount).toEqual(1);

    target.setAttribute("other-value", "change");

    await waitFor();
    expect(cleanupCount).toEqual(0);
    expect(updateCount).toEqual(1);
  });
});
