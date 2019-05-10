import { withFixture, selector, selectorAll, text, waitFor } from "./fixture";
import { html, useSelector, useState } from "..";

const fixtureCurrent = () => {
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
};

const fixtureAll = () => {
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
};

describe("use-selector/current", () => {
  describe(
    "current",
    withFixture(fixtureCurrent, elName => {
      let target: Element;
      let input: HTMLInputElement;
      let div: HTMLDivElement;

      const setup = async () => {
        await waitFor();
        target = selector(elName);
        input = selector("input", target);
        div = selector("div", target);
      };

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
    })
  );

  describe(
    "all",
    withFixture(fixtureAll, elName => {
      let target: Element;
      let input1: HTMLInputElement;
      let input2: HTMLInputElement;
      let div: HTMLDivElement;

      const setup = async () => {
        await waitFor();
        target = selector(elName);
        [input1, input2] = selectorAll<HTMLInputElement>("input", target);
        div = selector("div", target);
      };

      it("mount", async () => {
        await setup();
        expect(input1.value).toEqual("");
        expect(input2.value).toEqual("");
        expect(text(div)).toEqual("");

        input1.value = "input";
        input1.dispatchEvent(
          Object.assign(new Event("keyup"), { keyCode: 13 })
        );

        await setup();
        expect(input1.value).toEqual("input");
        expect(text(div)).toEqual("input");

        input2.value = "value";
        input2.dispatchEvent(
          Object.assign(new Event("keyup"), { keyCode: 13 })
        );

        await setup();
        expect(input2.value).toEqual("value");
        expect(text(div)).toEqual("input value");
      });
    })
  );
});
