import { expect } from "chai";
import {
  withFixtures,
  selector,
  text,
  createFixture,
  createCaughtErrorPromise
} from "./fixture";
import { html, useState, useCallback } from "..";
import { defineElement } from "../component";
import { useAttribute, useEffect, useRef } from "../hooks";

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
const fixtureZombieChildren = () => {
  const [todos, setTodos] = useState(state.todos);
  useEffect(() => {
    listeners.push(() => {
      setTodos(state.todos);
    });
  });
  return todos.map(
    t => html`
      <zombie-child-element :key=${t.id} id=${t.id}></zombie-child-element>
    `
  );
};

defineElement("zombie-child-element", () => {
  const id = useAttribute("id");
  const content = state.todos.find(t => t.id === id);
  return html`
    <div>${content}</div>
    <button @click=${() => deleteTodo(id)}>delete</button>
  `;
});

const fixtureHasError = createFixture(() => {
  throw new Error("error in component");
});

let cleanupCounts = [0, 0];
const fixtureCleanup = createFixture(() => {
  useEffect(() => () => cleanupCounts[0]++);
  useRef(null); // hook has no cleanup
  useEffect(() => () => cleanupCounts[1]++);
  return html``;
});

describe(
  "component",
  withFixtures(
    fixture,
    fixtureZombieChildren
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

    it("zombie children", async () => {
      target = await f2.setup();
      let childA = selector("[id=A]", target);
      button = selector("button", childA);

      button.click();

      await f2.setup();
      childA = selector("[id=A]", target);
      expect(childA).is.null;
    });

    it("has error", async () => {
      const caughtError = createCaughtErrorPromise();

      fixtureHasError.define();
      fixtureHasError.mount();
      const target = await fixtureHasError.setup();
      await caughtError;
      expect(target.innerHTML).to.equal("");
    });

    it("cleanup", async () => {
      cleanupCounts = [0, 0];
      fixtureCleanup.define();
      fixtureCleanup.mount();
      await fixtureCleanup.setup();
      fixtureCleanup.unmount();
      await fixtureCleanup.setup();
      expect(cleanupCounts).to.deep.equal([1, 1]);
    });
  })
);
