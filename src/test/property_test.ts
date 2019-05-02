import {
  mountFixture,
  unmountFixture,
  selectFixture,
  selector,
  text,
  waitFor
} from "./helpers/fixture";

import { html, defineElement, useProperty } from "..";

interface User {
  name: string;
  age: string;
}

describe("use-property", () => {
  let target: Element;
  let div: HTMLDivElement;

  const setup = async () => {
    await waitFor();
    target = selectFixture("user-info");
    div = selector("div", target);
  };

  beforeAll(() => {
    function UserInfo() {
      const user: User = useProperty("user");
      if (!user) {
        return html`
          <div>No user</div>
        `;
      }
      return html`
        <div>${user.name} (${user.age})</div>
      `;
    }

    defineElement("user-info", UserInfo);
  });

  beforeEach(() => {
    mountFixture(`
      <user-info></user-info>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

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
});
