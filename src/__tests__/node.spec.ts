import { expect } from "chai";
import { isBrowser } from "../env";
import { defineElement } from "../fuco";

describe("Node Environment", () => {
  it("is not browser", () => {
    expect(isBrowser).is.false;
  });

  it("should register", () => {
    const key = "test-class";
    const Test = () => "test";

    defineElement(key, Test);

    expect($fucoGlobal.__defs).has.key(key);
    expect($fucoGlobal.__defs[key]).to.equal(Test);
  });
});
