import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import "./components/show-input";

describe("use-query", () => {
  let target: Element;
  let input: HTMLInputElement;
  let div: HTMLDivElement;

  const setup = async () => {
    await waitFor();
    target = selectFixture("show-input");
    input = target.shadowRoot.querySelector("input");
    div = target.shadowRoot.querySelector("div");
  };

  beforeEach(() => {
    mountFixture(`
      <show-input></show-input>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    await setup();
    expect(input.value).toEqual("");
    expect(div.textContent.trim()).toEqual("");

    input.value = "Input";
    input.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(input.value).toEqual("Input");
    expect(div.textContent.trim()).toEqual("Input");
  });
});
