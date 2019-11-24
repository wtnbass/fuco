/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { withFixtures, text, selectorAll } from "./fixture";
import { html, useProperty, useRef } from "..";

interface User {
  name: string;
  age: string;
}

const fixture = () => {
  const user: User = useProperty("user");
  const updateCount = useRef(0);
  if (!user) {
    return html`
      <div>No user</div>
    `;
  }
  return html`
    <div>${user.name} (${user.age})</div>
    <div>${updateCount.current!++}</div>
  `;
};

const fixtureNumber = () => {
  const num = useProperty<number>("num");
  const updateCount = useRef(0);
  return html`
    <div>${num}</div>
    <div>${updateCount.current!++}</div>
  `;
};

describe(
  "use-property",
  withFixtures(
    fixture,
    fixtureNumber
  )(f => {
    let target: Element & { user: User; num: number };
    let div: HTMLDivElement;
    let count: HTMLDivElement;

    const setup = async (index: number) => {
      target = (await f[index].setup()) as Element & {
        user: User;
        num: number;
      };
      [div, count] = selectorAll<HTMLDivElement>("div", target);
    };

    it("mount", async () => {
      await setup(0);
      expect(text(div)).toEqual("No user");
    });

    it("propeties changed", async () => {
      const user = {
        name: "Bob",
        age: "18"
      };
      await setup(0);
      target.user = user;

      await setup(0);
      expect(target.user).toEqual(user);
      expect(text(div)).toEqual("Bob (18)");
      expect(text(count)).toEqual("0");

      // No update to set a same value
      target.user = user;
      await setup(0);
      expect(text(count)).toEqual("0");
    });

    it("compare as SameValue", async () => {
      await setup(1);
      expect(text(count)).toEqual("0");

      target.num = +0;

      await setup(1);
      expect(text(count)).toEqual("1");

      target.num = -0;

      await setup(1);
      expect(text(count)).toEqual("2");

      target.num = NaN;

      await setup(1);
      expect(text(count)).toEqual("3");

      target.num = Number("a");

      await setup(1);
      expect(text(count)).toEqual("3");
    });
  })
);
