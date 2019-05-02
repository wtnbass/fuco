import {
  mountFixture,
  unmountFixture,
  selectFixture,
  selector,
  text,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useSelector, useState } from "..";

describe("use-selector/current", () => {
  let target: Element;
  let input: HTMLInputElement;
  let div: HTMLDivElement;

  const setup = async () => {
    await waitFor();
    target = selectFixture("show-input");
    input = selector("input", target);
    div = selector("div", target);
  };

  beforeAll(() => {
    function Show() {
      const [value, set] = useState("");
      const input = useSelector<HTMLInputElement>("#input");

      return html`
        <input
          type="text"
          id="input"
          @keyup=${() => set(input.current ? input.current.value : "")}
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
    expect(text(div)).toEqual("");

    input.value = "Input";
    input.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(input.value).toEqual("Input");
    expect(text(div)).toEqual("Input");
  });
});
