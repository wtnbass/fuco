import { withFixture, selector, selectorAll, waitFor } from "./fixture";

import { html, useReducer, useCallback } from "..";

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
type Action = ReturnType<typeof addTodo | typeof toggleComplete>;

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

  const handleKeyup = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === 13) {
      const input = e.target as HTMLInputElement;
      dispatch(addTodo(input.value));
      input.value = "";
    }
  });

  return html`
    <style>
      .completed {
        text-decoration: line-through;
      }
    </style>
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
  `;
};

describe(
  "use-reducer",
  withFixture(fixture, elName => {
    let input: HTMLInputElement;
    let list: NodeListOf<Element>;

    beforeAll(() => {});

    const setup = async () => {
      await waitFor();
      const target = selector(elName);
      input = selector("input", target);
      list = selectorAll("ul > li", target);
    };

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
  })
);
