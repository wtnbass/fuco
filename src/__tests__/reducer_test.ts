/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "chai";
import { withFixtures, selector, selectorAll, text } from "./fixture";
import { html, useReducer, useCallback, useRef } from "../fuco";

type ID = number;

interface Todo {
  id: ID;
  text: string;
  completed: boolean;
}

const genId = (): ID => Date.now() + Math.random();

const addTodo = (text: string) => ({
  type: "ADD_TODO" as const,
  text,
});

const toggleComplete = (id: ID) => ({
  type: "TOGGLE_COMPLETE" as const,
  id,
});

type State = Todo[];
type Action =
  | ReturnType<typeof addTodo | typeof toggleComplete>
  | { type: "NOOP" };

function reducer(state: State = [], action: Action): State {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, { id: genId(), text: action.text, completed: false }];
    case "TOGGLE_COMPLETE":
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    default:
      return state;
  }
}

const fixture = () => {
  const [state, dispatch] = useReducer(reducer, []);
  const updated = useRef(0);

  const handleKeyup = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === 13) {
      const input = e.target as HTMLInputElement;
      dispatch(addTodo(input.value));
      input.value = "";
    }
  }, []);

  return html`
    <input type="text" @keyup=${handleKeyup} />
    <ul>
      ${state.map(
        ({ id, text, completed }) => html`
          <li
            class=${completed ? "completed" : ""}
            @click=${() => dispatch(toggleComplete(id))}
          >
            ${text}
          </li>
        `
      )}
    </ul>
    <button @click=${() => dispatch({ type: "NOOP" })}>noop</button>
    <div>${updated.current!++}</div>
  `;
};

const fixtureNumber = () => {
  const [, dispatch] = useReducer<number, number>((_, a) => a, +0);
  const updated = useRef(0);

  return html`
    <div>${updated.current!++}</div>
    <button @click=${() => dispatch(-0)}></button>
    <button @click=${() => dispatch(NaN)}></button>
    <button @click=${() => dispatch(Number("a"))}></button>
  `;
};

describe(
  "use-reducer",
  withFixtures(
    fixture,
    fixtureNumber
  )((f) => {
    it("mount", async () => {
      let input!: HTMLInputElement;
      let list!: NodeListOf<Element>;
      let noop!: HTMLButtonElement;
      let updated!: HTMLDivElement;

      const setup = async () => {
        const target = await f[0].setup();
        input = selector("input", target);
        list = selectorAll("ul > li", target);
        noop = selector("button", target);
        updated = selector("div", target);
      };
      await setup();
      expect(input.value).to.equal("");
      expect(list.length).to.equal(0);
      expect(text(updated)).to.equal("0");

      // add todo
      await setup();
      input.value = "Do test";
      input.dispatchEvent(
        Object.assign(new CustomEvent("keyup"), { keyCode: 13 })
      );

      await setup();
      setup();
      expect(input.value).to.equal("");
      expect(list.length).to.equal(1);
      expect(text(updated)).to.equal("1");

      // toggle complete
      await setup();
      list[0].dispatchEvent(new Event("click"));

      await setup();
      expect(list[0].getAttribute("class")).to.equal("completed");
      expect(text(updated)).to.equal("2");

      // noop
      noop.click();

      await setup();
      expect(text(updated)).to.equal("2");
    });

    it("compare as SameValue", async () => {
      let btns!: HTMLButtonElement[];
      let updated!: HTMLDivElement;
      const setup = async () => {
        const target = await f[1].setup();
        btns = [...selectorAll<HTMLButtonElement>("button", target)];
        updated = selector("div", target);
      };

      await setup();
      expect(text(updated)).to.equal("0");

      // +0 => -0
      btns[0].click();

      await setup();
      expect(text(updated)).to.equal("1");

      btns[1].click();

      await setup();
      expect(text(updated)).to.equal("2");

      // NaN => NaN
      btns[2].click();

      await setup();
      expect(text(updated)).to.equal("2");
    });
  })
);
