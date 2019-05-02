/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useMemo, useState } from "..";

describe("use-memo", () => {
  let target: Element;
  let firstName: HTMLInputElement;
  let lastName: HTMLInputElement;
  let age: HTMLInputElement;
  let div: HTMLDivElement;
  let updateCount = 0;

  const setup = async () => {
    await waitFor();
    target = selectFixture("full-name")!;
    [firstName, lastName, age] = target.shadowRoot!.querySelectorAll("input");
    div = target.shadowRoot!.querySelector("div")!;
  };

  beforeAll(() => {
    const input = (fn: Function) => (e: KeyboardEvent) => {
      const el = e.target as HTMLInputElement;
      fn(el.value);
    };

    defineElement("full-name", () => {
      const [firstName, setFirst] = useState("Keisuke");
      const [lastName, setLast] = useState("Watanabe");
      const [age, setAge] = useState("27");

      const fullName = useMemo(() => {
        updateCount++;
        return firstName + " " + lastName;
      }, [firstName, lastName]);

      return html`
        <input type="text" .value=${firstName} @keyup=${input(setFirst)} />
        <input type="text" .value=${lastName} @keyup=${input(setLast)} />
        <input type="text" .value=${age} @keyup=${input(setAge)} />
        <div>${fullName} (${age})</div>
      `;
    });
  });

  beforeEach(() => {
    updateCount = 0;
    mountFixture(`
      <full-name></full-name>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    await setup();
    expect(firstName.value).toEqual("Keisuke");
    expect(lastName.value).toEqual("Watanabe");
    expect(age.value).toEqual("27");
    expect(div.textContent!.trim()).toEqual("Keisuke Watanabe (27)");
    expect(updateCount).toEqual(1);
  });

  it("update watched fields", async () => {
    await setup();
    expect(updateCount).toEqual(1);

    firstName.value = "Taro";
    firstName.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(firstName.value).toEqual("Taro");
    expect(lastName.value).toEqual("Watanabe");
    expect(age.value).toEqual("27");
    expect(div.textContent!.trim()).toEqual("Taro Watanabe (27)");
    expect(updateCount).toEqual(2);

    lastName.value = "Tanaka";
    lastName.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(firstName.value).toEqual("Taro");
    expect(lastName.value).toEqual("Tanaka");
    expect(div.textContent!.trim()).toEqual("Taro Tanaka (27)");
    expect(age.value).toEqual("27");
    expect(updateCount).toEqual(3);
  });

  it("update unwatched fields", async () => {
    await setup();

    age.value = "100";
    age.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

    await setup();
    expect(firstName.value).toEqual("Keisuke");
    expect(lastName.value).toEqual("Watanabe");
    expect(age.value).toEqual("100");
    expect(div.textContent!.trim()).toEqual("Keisuke Watanabe (100)");
    expect(updateCount).toEqual(1);
  });
});
