/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { withFixtures, selector, selectorAll, text } from "./fixture";
import { html, useReducer, useCallback, useRef } from "..";

type ID = number;

interface Todo {
  id: ID;
  text: string;
  completed: boolean;
}

const genId = (): ID => Date.now() + Math.random();

const addTodo = (text: string) => ({
  type: "ADD_TODO" as "ADD_TODO",
  text
});

const toggleComplete = (id: ID) => ({
  type: "TOGGLE_COMPLETE" as "TOGGLE_COMPLETE",
  id
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
      return state.map(todo =>
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

describe(
  "use-reducer",
  withFixtures(fixture)(([f]) => {
    let input: HTMLInputElement;
    let list: NodeListOf<Element>;
    let noop: HTMLButtonElement;
    let updated: HTMLDivElement;

    beforeAll(() => {});

    const setup = async () => {
      const target = await f.setup();
      input = selector("input", target);
      list = selectorAll("ul > li", target);
      noop = selector("button", target);
      updated = selector("div", target);
    };

    it("mount", async () => {
      await setup();
      expect(input.value).toEqual("");
      expect(list.length).toEqual(0);
      expect(text(updated)).toEqual("0");

      // add todo
      await setup();
      input.value = "Do test";
      input.dispatchEvent(
        Object.assign(new CustomEvent("keyup"), { keyCode: 13 })
      );

      await setup();
      setup();
      expect(input.value).toEqual("");
      expect(list.length).toEqual(1);
      expect(text(updated)).toEqual("1");

      // toggle complete
      await setup();
      list[0].dispatchEvent(new Event("click"));

      await setup();
      expect(list[0].getAttribute("class")).toEqual("completed");
      expect(text(updated)).toEqual("2");

      // noop
      noop.click();

      await setup();
      expect(text(updated)).toEqual("2");
    });
  })
);
