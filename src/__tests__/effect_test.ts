import { withFixtures, waitFor } from "./fixture";
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
  withFixtures(fixture)(([f]) => {
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
      f.unmount();
      expect(cleanupCount).toEqual(1);
    });

    it("update", async () => {
      const target = await f.setup();
      expect(updateCount).toEqual(1);

      target.setAttribute("value", "change");

      await waitFor();
      expect(cleanupCount).toEqual(1);
      expect(updateCount).toEqual(2);
    });

    it("no update", async () => {
      const target = await f.setup();
      expect(updateCount).toEqual(1);

      target.setAttribute("other-value", "change");

      await waitFor();
      expect(cleanupCount).toEqual(0);
      expect(updateCount).toEqual(1);
    });
  })
);
