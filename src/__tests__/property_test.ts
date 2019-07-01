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

describe(
  "use-property",
  withFixtures(fixture)(([f]) => {
    let target: Element & { user: User };
    let div: HTMLDivElement;
    let count: HTMLDivElement;

    const setup = async () => {
      target = (await f.setup()) as Element & { user: User };
      [div, count] = selectorAll<HTMLDivElement>("div", target);
    };

    it("mount", async () => {
      await setup();
      expect(text(div)).toEqual("No user");
    });

    it("propeties changed", async () => {
      const user = {
        name: "Bob",
        age: "18"
      };
      await setup();
      target.user = user;

      await setup();
      expect(target.user).toEqual(user);
      expect(text(div)).toEqual("Bob (18)");
      expect(text(count)).toEqual("0");

      // No update to set a same value
      target.user = user;
      await setup();
      expect(text(count)).toEqual("0");
    });
  })
);
