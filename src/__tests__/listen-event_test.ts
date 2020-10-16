import { expect } from "chai";
import { withFixtures, selector, text } from "./fixture";
import { html, useListenEvent, useState } from "../fuco";

const fixtureCustomEvent = () => {
  const [value, setValue] = useState<unknown>(null);
  useListenEvent("custom-event", (e: CustomEvent) => {
    setValue(e.detail);
  });
  return html` <div>${value}</div> `;
};

const fixtureClickEvent = () => {
  const [clicked, setClicked] = useState<boolean>(false);
  useListenEvent("click", () => {
    setClicked(true);
  });
  return html` <div>${clicked}</div> `;
};

describe(
  "use-listen-event",
  withFixtures(
    fixtureCustomEvent,
    fixtureClickEvent
  )(([f1, f2]) => {
    it("listen custom event", async () => {
      const el = await f1.setup();
      el.dispatchEvent(new CustomEvent("custom-event", { detail: "fire!" }));

      await f1.setup();
      const div = selector("div", el);
      expect(text(div)).to.equal("fire!");
    });

    it("listen click event", async () => {
      const el = await f2.setup();
      el.dispatchEvent(new Event("click"));

      await f2.setup();
      const div = selector("div", el);
      expect(text(div)).to.equal("true");
    });
  })
);
