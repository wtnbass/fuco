import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import "./components/todo-app";

describe("use-reducer", () => {
  let input: HTMLInputElement;
  let list: NodeListOf<Element>;

  const setup = () => {
    const target = selectFixture("todo-app");
    input = target.shadowRoot.querySelector("input");
    list = target.shadowRoot.querySelectorAll("ul > li");
  };

  beforeEach(() => {
    mountFixture(`
      <todo-app></todo-app>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("mount", async () => {
    setup();
    expect(input.value).toEqual("");
    expect(list.length).toEqual(0);
  });

  it("add todo", async () => {
    setup();
    input.value = "Do test";
    const e = Object.assign(new CustomEvent("keyup"), { keyCode: 13 });
    input.dispatchEvent(e);

    await waitFor();
    setup();
    expect(input.value).toEqual("");
    expect(list.length).toEqual(1);
  });

  it("toggle complete", async () => {
    setup();
    input.value = "Do test";
    const e = Object.assign(new Event("keyup"), { keyCode: 13 });
    input.dispatchEvent(e);
    await waitFor();

    setup();
    list[0].dispatchEvent(new Event("click"));
    await waitFor();

    setup();
    expect(list[0].getAttribute("class")).toEqual("completed");
  });
});
