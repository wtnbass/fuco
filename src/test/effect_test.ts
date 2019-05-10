import { withFixture, unmountFixture, selector, waitFor } from "./fixture";
import { html, useAttribute, useEffect } from "..";

let updateCount = 0;
let cleanupCount = 0;

const fixture = () => {
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
};

describe(
  "use-effect",
  withFixture(fixture, elName => {
    beforeEach(() => {
      updateCount = 0;
      cleanupCount = 0;
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
      const target = selector(elName);
      expect(updateCount).toEqual(1);

      target.setAttribute("value", "change");

      await waitFor();
      expect(cleanupCount).toEqual(1);
      expect(updateCount).toEqual(2);
    });

    it("no update", async () => {
      await waitFor();
      const target = selector(elName);
      expect(updateCount).toEqual(1);

      target.setAttribute("other-value", "change");

      await waitFor();
      expect(cleanupCount).toEqual(0);
      expect(updateCount).toEqual(1);
    });
  })
);
