import { expect } from "chai";
import { isBrowser } from "../env";
import { defineElement, __def__ } from "..";

describe("Node Environment", () => {
  it("is not browser", () => {
    expect(isBrowser).is.false;
  });

  it("should register", () => {
    const key = "test-class";
    const Test = () => "test";

    defineElement(key, Test);

    expect(__def__).has.key(key);
    expect(__def__[key]).to.equal(Test);
  });
});
