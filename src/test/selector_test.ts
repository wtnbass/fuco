/* eslint-disable @typescript-eslint/no-non-null-assertion */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useSelector, useState } from "..";

describe("use-selector/current", () => {
  let target: Element;
  let input: HTMLInputElement;
  let div: HTMLDivElement;

  const setup = async () => {
    await waitFor();
    target = selectFixture("show-input")!;
    input = target.shadowRoot!.querySelector("input")!;
    div = target.shadowRoot!.querySelector("div")!;
  };

  beforeAll(() => {
    function Show() {
      const [value, set] = useState("");
      const input = useSelector<HTMLInputElement>("#input");

      return html`
        <input
          type="text"
          id="input"
          @keyup=${() => set(input.current!.value)}
        />
        <div>${value}</div>
      `;
    }

    defineElement("show-input", Show);
  });

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
    expect(div.textContent!.trim()).toEqual("");

    input.value = "Input";
    input.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(input.value).toEqual("Input");
    expect(div.textContent!.trim()).toEqual("Input");
  });
});
