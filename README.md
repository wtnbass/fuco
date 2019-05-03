# functional-web-component

[![npm](https://img.shields.io/npm/v/functional-web-component.svg)](https://www.npmjs.com/package/functional-web-component)
[![Build Status](https://travis-ci.com/wtnbass/functional-web-component.svg?branch=master)](https://travis-ci.com/wtnbass/functional-web-component)

Functional Component like React, but for Web Components.

```html
<!DOCTYPE html>
<html lang="en">
  <body>
    <counter-app></counter-app>
    <script type="module">
      import {
        html,
        defineElement,
        useState
      } from "https://unpkg.com/functional-web-component?module";

      function Counter() {
        const [count, setCount] = useState(0);
        return html`
          <div>${count}</div>
          <button @click=${() => setCount(count + 1)}>+</button>
          <button @click=${() => setCount(count - 1)}>-</button>
        `;
      }

      defineElement("counter-app", Counter);
    </script>
  </body>
</html>
```

- [Installation](#Installation)
- [Hooks](#Hooks)
  - [useProperty](#useProperty)
  - [useSelector](#useSelector)
  - [useDispatchEvent](#useDispatchEvent)
  - [useStyle](#useStyle)
- [Context](#Context)

## Installation

```sh
npm install functional-web-component
# or use yarn
yarn add functional-web-component
```

## Hooks

- Hooks related with WebComponent

  - [useProperty](#useProperty)
  - [useSelector](#useSelector)
  - [useDispatchEvent](#useDispatchEvent)
  - [useStyle](#useStyle)

- Hooks like React's
  - useState
  - useReducer
  - useContext
  - useMemo
  - useCallback

### useProperty

Using `useProperty` allow to recieve node's Javascript property value and update the component when the value of this property changes.

```js
defineElement("greet-element", () => {
  const name = useAttribute("name");
  return html`
    <div>Hello, ${name}!</div>
  `;
});

// Use it like:
html`
  <greet-element name="World"></greet-element>
`;

defineElement("card-element", () => {
  const card = useProperty("card");
  return html`
    <div>${card.mark} ${card.value}</div>
  `;
});

// Use it like:
const heartAce = { mark: "♥", value: 1 };
html`
  <card-element .card=${heartAce}></card-element>
`;
```

### useSelector

If you want to access DOM, `useSelector` makes you to touch the returned DOM.

```js
function App() {
  const inputRef = useSelector("#todo");
  // inputRef.current === <input id="todo" />
  const buttonRef = useSelector("button");
  // buttonRef.all === <button>A</button> and <button>A</button>

  return html`
    <input id="todo" />
    <button>A</button>
    <button>B</button>
  `;
}
```

### useDispatchEvent

If you want to use CustomEvent, `useDispatchEvent` offers you `dispatch` function like `dispatchEvent`.

```js
defineElement("send-message", () => {
  const dispatch = useDispatchEvent("some-message", {
    bubbles: true,
    composed: true
  });
  return html`
    <button @click=${() => dispatch("Hi!")}>Send</button>
  `;
});

// You can listen custom event using `@` prefix like:
html`
  <send-message @some-message=${e => console.log(e.detail)}></send-message>
`;
```

### useStyle (experimental)

At first time rendering, `useStyle` adapt StyleSheet to the component.

```js
function HelloWorld() {
  useStyle(css`
    div {
      color: red;
    }
  `);
  return html`
    <div>Hello, world</div>
  `;
}
```

## Context

`createContext` offers `Context`, and using`Context.defineProvider` to define provider.

You can consume it useing `useContext(Context)`.

```js
const ThemeContext = createContext();

// define a custom element as Provider
ThemeContext.defineProvider("theme-provider");

const App = () => html`
  <theme-provider .value=${1}>
    <theme-comsumer></theme-comsumer>
  </theme-provider>
`;

// consume context
defineElement("theme-consumer", () => {
  const theme = useContext(ThemeContext);
  return html`
    <div>theme is ${theme}</div>
  `;
});
```

## License

MIT
