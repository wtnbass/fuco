import { expect } from "chai";
import { isBrowser } from "../env";
import { defineElement, __FucoRegistry__ } from "../define-element";

describe("Node Environment", () => {
  it("is not browser", () => {
    expect(isBrowser).is.false;
  });

  it("should register", () => {
    const key = "test-class";
    const Test = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defineElement(key, Test as any);

    expect(__FucoRegistry__).has.key(key);
    expect(__FucoRegistry__[key]).to.equal(Test);
  });
});
