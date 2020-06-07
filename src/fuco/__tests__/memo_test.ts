import { expect } from "chai";
import { withFixtures, selector, selectorAll, text } from "./fixture";
import { html, useMemo, useState } from "..";

let updateCount = 0;
let updateCount2 = 0;

const input = (fn: (value: string) => void) => (e: KeyboardEvent) => {
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

  const memo = useMemo(() => {
    updateCount2++;
    return "";
  });

  return html`
    <input type="text" .value=${firstName} @keyup=${input(setFirst)} />
    <input type="text" .value=${lastName} @keyup=${input(setLast)} />
    <input type="text" .value=${age} @keyup=${input(setAge)} />
    <div>${fullName} (${age})</div>
    <div>${memo}</div>
  `;
};

describe(
  "use-memo",
  withFixtures(fixture)(([f]) => {
    let target: Element;
    let firstName: HTMLInputElement;
    let lastName: HTMLInputElement;
    let age: HTMLInputElement;
    let div: HTMLDivElement;

    const setup = async () => {
      target = await f.setup();
      [firstName, lastName, age] = selectorAll<HTMLInputElement>(
        "input",
        target
      );
      div = selector("div", target);
    };

    beforeEach(() => {
      updateCount = 0;
      updateCount2 = 0;
    });

    it("mount", async () => {
      await setup();
      expect(firstName.value).to.equal("Keisuke");
      expect(lastName.value).to.equal("Watanabe");
      expect(age.value).to.equal("27");
      expect(text(div)).to.equal("Keisuke Watanabe (27)");
      expect(updateCount).to.equal(1);
    });

    it("update fields", async () => {
      await setup();
      expect(updateCount).to.equal(1);
      expect(updateCount2).to.equal(1);

      firstName.value = "Taro";
      firstName.dispatchEvent(
        Object.assign(new Event("keyup"), { keyCode: 13 })
      );

      await setup();
      expect(firstName.value).to.equal("Taro");
      expect(lastName.value).to.equal("Watanabe");
      expect(age.value).to.equal("27");
      expect(text(div)).to.equal("Taro Watanabe (27)");
      expect(updateCount).to.equal(2);
      expect(updateCount2).to.equal(2);

      lastName.value = "Tanaka";
      lastName.dispatchEvent(
        Object.assign(new Event("keyup"), { keyCode: 13 })
      );

      await setup();
      expect(firstName.value).to.equal("Taro");
      expect(lastName.value).to.equal("Tanaka");
      expect(text(div)).to.equal("Taro Tanaka (27)");
      expect(age.value).to.equal("27");
      expect(updateCount).to.equal(3);
      expect(updateCount2).to.equal(3);

      age.value = "100";
      age.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: 13 }));

      await setup();
      expect(firstName.value).to.equal("Taro");
      expect(lastName.value).to.equal("Tanaka");
      expect(text(div)).to.equal("Taro Tanaka (100)");
      expect(age.value).to.equal("100");
      expect(updateCount).to.equal(3);
      expect(updateCount2).to.equal(4);
    });
  })
);
