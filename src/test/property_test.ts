import { withFixture, selector, text, waitFor } from "./fixture";

import { html, useProperty } from "..";

interface User {
  name: string;
  age: string;
}

const fixture = () => {
  const user: User = useProperty("user");
  if (!user) {
    return html`
      <div>No user</div>
    `;
  }
  return html`
    <div>${user.name} (${user.age})</div>
  `;
};

describe(
  "use-property",
  withFixture(fixture, elName => {
    let target: Element;
    let div: HTMLDivElement;

    const setup = async () => {
      await waitFor();
      target = selector(elName);
      div = selector("div", target);
    };

    it("mount", async () => {
      await setup();
      expect(text(div)).toEqual("No user");
    });

    it("propeties changed", async () => {
      await setup();
      (target as Element & { user: User }).user = {
        name: "Bob",
        age: "18"
      };

      await setup();
      expect(text(div)).toEqual("Bob (18)");
    });
  })
);
