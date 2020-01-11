import { expect } from "chai";
import { isBrowser } from "../env";
import { defineElement, Registry } from "../define-element";

describe("Node Environment", () => {
  it("is not browser", () => {
    expect(isBrowser).is.false;
  });

  it("should register", () => {
    const key = "test-class";
    const Test = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defineElement(key, Test as any);

    expect(Registry).has.key(key);
    expect(Registry[key]).to.equal(Test);
  });
});
