import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import "./components/input-join";

describe("use-query-all", () => {
  let target: Element;
  let input1: HTMLInputElement;
  let input2: HTMLInputElement;
  let div: HTMLDivElement;

  const setup = async () => {
    await waitFor();
    target = selectFixture("input-join");
    [input1, input2] = target.shadowRoot.querySelectorAll("input");
    div = target.shadowRoot.querySelector("div");
  };

  beforeEach(() => {
    mountFixture(`
      <input-join></input-join>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    await setup();
    expect(input1.value).toEqual("");
    expect(input2.value).toEqual("");
    expect(div.textContent.trim()).toEqual("");

    input1.value = "input";
    input1.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(input1.value).toEqual("input");
    expect(div.textContent.trim()).toEqual("Input");

    input2.value = "value";
    input2.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(input2.value).toEqual("value");
    expect(div.textContent.trim()).toEqual("InputValue");
  });
});
