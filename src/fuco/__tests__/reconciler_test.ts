import { expect } from "chai";
import {
  html,
  defineElement,
  useAttribute,
  useEffect,
  useLayoutEffect,
} from "..";
import { withFixtures } from "./fixture";

let callstack: string[] = [];
const defineWithStack = (name: string, f: () => unknown) => {
  defineElement(name, () => {
    callstack.push(`render:${name}`);
    useEffect(() => {
      callstack.push(`effect:${name}`);
    });
    useLayoutEffect(() => {
      callstack.push(`layoutEffect:${name}`);
    });
    return f();
  });
};
const fixture = () => {
  useAttribute("test");
  return html` <reconciler-test></reconciler-test> `;
};
defineWithStack(
  "reconciler-test",
  () => html`
    <reconciler-test-a></reconciler-test-a>
    <reconciler-test-b></reconciler-test-b>
  `
);
defineWithStack(
  "reconciler-test-a",
  () => html` <reconciler-test-a-a></reconciler-test-a-a> `
);
defineWithStack("reconciler-test-b", () => html``);
defineWithStack("reconciler-test-a-a", () => html``);

describe(
  "reconciler",
  withFixtures(fixture)(([f]) => {
    beforeEach(() => {
      callstack = [];
    });
    it("render, layoutEffet and effect are called in correct order", async () => {
      await f.setup();
      expect(callstack).to.deep.equal([
        "render:reconciler-test",
        "render:reconciler-test-a",
        "render:reconciler-test-b",
        "render:reconciler-test-a-a",
        "layoutEffect:reconciler-test-a-a",
        "layoutEffect:reconciler-test-b",
        "layoutEffect:reconciler-test-a",
        "layoutEffect:reconciler-test",
        "effect:reconciler-test-a-a",
        "effect:reconciler-test-b",
        "effect:reconciler-test-a",
        "effect:reconciler-test",
      ]);
    });
  })
);
