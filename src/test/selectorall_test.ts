import {
  mountFixture,
  unmountFixture,
  selectFixture,
  selector,
  selectorAll,
  text,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useSelector, useState } from "..";

describe("use-selector/all", () => {
  let target: Element;
  let input1: HTMLInputElement;
  let input2: HTMLInputElement;
  let div: HTMLDivElement;

  const setup = async () => {
    await waitFor();
    target = selectFixture("input-join");
    [input1, input2] = selectorAll<HTMLInputElement>("input", target);
    div = selector("div", target);
  };

  beforeAll(() => {
    function InputJoin() {
      const [value, setValue] = useState("");
      const ref = useSelector<HTMLInputElement>(".input");
      const change = () => {
        if (!ref.all) return;
        const [first, second] = ref.all;
        setValue(first.value + " " + second.value);
      };

      return html`
        <input type="text" class="input" @keyup=${change} />
        <input type="text" class="input" @keyup=${change} />
        <div>${value}</div>
      `;
    }

    defineElement("input-join", InputJoin);
  });

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
    expect(text(div)).toEqual("");

    input1.value = "input";
    input1.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(input1.value).toEqual("input");
    expect(text(div)).toEqual("input");

    input2.value = "value";
    input2.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(input2.value).toEqual("value");
    expect(text(div)).toEqual("input value");
  });
});
