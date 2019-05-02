import { html, defineElement, useReducer, useCallback } from "../..";

type ID = number;

interface Todo {
  id: ID;
  text: string;
  completed: boolean;
}

const genId = (): ID => Date.now() + Math.random();

function addTodo(text: string) {
  const todo: Todo = { id: genId(), text, completed: false };
  return {
    type: "ADD_TODO" as "ADD_TODO",
    todo
  };
}

function toggleComplete(id: ID) {
  return {
    type: "TOGGLE_COMPLETE" as "TOGGLE_COMPLETE",
    id
  };
}

type State = Todo[];
type Action = ReturnType<typeof addTodo | typeof toggleComplete>;

function reducer(state: State = [], action: Action): State {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, action.todo];
    case "TOGGLE_COMPLETE":
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    default:
      return state;
  }
}

function TodoApp() {
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
}

defineElement("todo-app", TodoApp);
