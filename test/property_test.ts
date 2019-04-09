import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import "./components/input-user";

describe("use-property", () => {
  let target: Element;
  let name: HTMLInputElement;
  let age: HTMLInputElement;

  const setup = async () => {
    await waitFor();
    const parent = selectFixture("input-user");
    target = parent.shadowRoot.querySelector("user-info");
    [name, age] = parent.shadowRoot.querySelectorAll("input");
  };

  beforeEach(() => {
    mountFixture(`
      <input-user></input-user>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    await setup();
    expect(name.value).toEqual("Alice");
    expect(age.value).toEqual("18");
    expect(target.shadowRoot.textContent.trim()).toEqual("Alice (18)");
  });

  it("propeties changed", async () => {
    await setup();
    name.value = "Bob";
    name.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(name.value).toEqual("Bob");
    expect(age.value).toEqual("18");
    expect(target.shadowRoot.textContent.trim()).toEqual("Bob (18)");

    age.value = "34";
    age.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(name.value).toEqual("Bob");
    expect(age.value).toEqual("34");
    expect(target.shadowRoot.textContent.trim()).toEqual("Bob (34)");
  });
});
