import { expect } from "chai";
import { withFixtures, selector, text, createFixture } from "./fixture";
import { html, useState, useCallback } from "..";
import { defineElement } from "../define-element";
import { useAttribute, useEffect } from "../hooks";

const fixture = () => {
  const [count, setCount] = useState(0);
  const million = useCallback(() => {
    for (let i = 0; i < 1000000; i++) {
      setCount(c => c + 1);
    }
  }, []);
  return html`
    <div>${count}</div>
    <button @click=${million}>+1000000</button>
  `;
};

const listeners: (() => void)[] = [];
const state = new Proxy(
  {
    todos: [{ id: "A", content: "a" }]
  },
  {
    set(target, name, value) {
      Reflect.set(target, name, value);
      listeners.forEach(l => l());
      return true;
    }
  }
);
const deleteTodo = (id: string | null) => {
  state.todos = state.todos.filter(t => t.id !== id);
};

// https://kaihao.dev/posts/Stale-props-and-zombie-children-in-Redux
const fixtureZonbieChildren = () => {
  const [todos, setTodos] = useState(state.todos);
  useEffect(() => {
    listeners.push(() => {
      setTodos(state.todos);
    });
  });
  return todos.map(
    t => html`
      <zonbie-child-element :key=${t.id} id=${t.id}></zonbie-child-element>
    `
  );
};

defineElement("zonbie-child-element", () => {
  const id = useAttribute("id");
  const content = state.todos.find(t => t.id === id);
  return html`
    <div>${content}</div>
    <button @click=${() => deleteTodo(id)}>delete</button>
  `;
});

const fixtureHasError = createFixture(() => {
  throw new Error();
});

describe(
  "component",
  withFixtures(
    fixture,
    fixtureZonbieChildren
  )(([f, f2]) => {
    let target: Element;
    let button: HTMLButtonElement;
    let div: HTMLDivElement;

    const setup = async () => {
      target = await f.setup();
      div = selector("div", target);
      button = selector("button", target);
    };

    it("million update", async () => {
      await setup();
      expect(text(div)).to.equal("0");

      button.click();

      await setup();
      expect(text(div)).to.equal("1000000");
    });

    it("zonbie children", async () => {
      target = await f2.setup();
      let childA = selector("[id=A]", target);
      button = selector("button", childA);

      button.click();

      await f2.setup();
      childA = selector("[id=A]", target);
      expect(childA).is.null;
    });

    it("has error", async () => {
      fixtureHasError.define();
      fixtureHasError.mount();
      const target = await fixtureHasError.setup();
      expect(target.innerHTML).to.equal("");
    });
  })
);
