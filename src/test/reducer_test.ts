import {
  mountFixture,
  unmountFixture,
  selectFixture,
  selector,
  selectorAll,
  waitFor
} from "./helpers/fixture";

import "./components/todo-app";

describe("use-reducer", () => {
  let input: HTMLInputElement;
  let list: NodeListOf<Element>;

  const setup = async () => {
    await waitFor();
    const target = selectFixture("todo-app");
    input = selector("input", target);
    list = selectorAll("ul > li", target);
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
    await setup();
    expect(input.value).toEqual("");
    expect(list.length).toEqual(0);
  });

  it("add todo", async () => {
    await setup();
    input.value = "Do test";
    const e = Object.assign(new CustomEvent("keyup"), { keyCode: 13 });
    input.dispatchEvent(e);

    await setup();
    setup();
    expect(input.value).toEqual("");
    expect(list.length).toEqual(1);
  });

  it("toggle complete", async () => {
    await setup();
    input.value = "Do test";
    const e = Object.assign(new Event("keyup"), { keyCode: 13 });
    input.dispatchEvent(e);

    await setup();
    list[0].dispatchEvent(new Event("click"));

    await setup();
    expect(list[0].getAttribute("class")).toEqual("completed");
  });
});
