/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import { html, defineElement, useProperty } from "..";

interface User {
  name: string;
  age: string;
}

describe("use-property", () => {
  let target: Element;

  const setup = async () => {
    await waitFor();
    target = selectFixture("user-info")!;
  };

  beforeAll(() => {
    function UserInfo() {
      const user: User = useProperty("user");
      if (!user) {
        return html`
          No user
        `;
      }
      return html`
        ${user.name} (${user.age})
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
    expect(target.shadowRoot!.textContent!.trim()).toEqual("No user");
  });

  it("propeties changed", async () => {
    await setup();
    (target as Element & { user: User }).user = {
      name: "Bob",
      age: "18"
    };

    await setup();
    expect(target.shadowRoot!.textContent!.trim()).toEqual("Bob (18)");
  });
});
