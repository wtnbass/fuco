import { withFixture, selector, selectorAll, text, waitFor } from "./fixture";
import { html, useMemo, useState } from "..";

let updateCount = 0;

const input = (fn: Function) => (e: KeyboardEvent) => {
  const el = e.target as HTMLInputElement;
  fn(el.value);
};

const fixture = () => {
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
};

describe(
  "use-memo",
  withFixture(fixture, elName => {
    let target: Element;
    let firstName: HTMLInputElement;
    let lastName: HTMLInputElement;
    let age: HTMLInputElement;
    let div: HTMLDivElement;

    const setup = async () => {
      await waitFor();
      target = selector(elName);
      [firstName, lastName, age] = selectorAll<HTMLInputElement>(
        "input",
        target
      );
      div = selector("div", target);
    };

    beforeEach(() => {
      updateCount = 0;
    });

    it("mount", async () => {
      await setup();
      expect(firstName.value).toEqual("Keisuke");
      expect(lastName.value).toEqual("Watanabe");
      expect(age.value).toEqual("27");
      expect(text(div)).toEqual("Keisuke Watanabe (27)");
      expect(updateCount).toEqual(1);
    });

    it("update watched fields", async () => {
      await setup();
      expect(updateCount).toEqual(1);

      firstName.value = "Taro";
      firstName.dispatchEvent(
        Object.assign(new Event("keyup"), { keyCode: 13 })
      );

      await setup();
      expect(firstName.value).toEqual("Taro");
      expect(lastName.value).toEqual("Watanabe");
      expect(age.value).toEqual("27");
      expect(text(div)).toEqual("Taro Watanabe (27)");
      expect(updateCount).toEqual(2);

      lastName.value = "Tanaka";
      lastName.dispatchEvent(
        Object.assign(new Event("keyup"), { keyCode: 13 })
      );

      await setup();
      expect(firstName.value).toEqual("Taro");
      expect(lastName.value).toEqual("Tanaka");
      expect(text(div)).toEqual("Taro Tanaka (27)");
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
      expect(text(div)).toEqual("Keisuke Watanabe (100)");
      expect(updateCount).toEqual(1);
    });
  })
);
