# fuco

[![npm](https://img.shields.io/npm/v/fuco.svg)](https://www.npmjs.com/package/fuco)
[![install size](https://packagephobia.now.sh/badge?p=fuco)](https://packagephobia.now.sh/result?p=fuco)
[![test](https://github.com/wtnbass/fuco/workflows/test/badge.svg)](https://github.com/wtnbass/fuco/actions)
[![codecov](https://codecov.io/gh/wtnbass/fuco/branch/master/graph/badge.svg)](https://codecov.io/gh/wtnbass/fuco)

Functional Component like React, but for Web Components.

```html
<!DOCTYPE html>
<html lang="en">
  <body>
    <counter-app></counter-app>
    <script type="module">
      import { html, defineElement, useState } from "//unpkg.com/fuco?module";

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
  - [useAttribute](#useAttribute)
  - [useProperty](#useProperty)
  - [useDispatchEvent](#useDispatchEvent)
  - [useStyle](#useStyle)
  - [useState](#useState)
  - [useReducer](#useReducer)
  - [useRef](#useRef)
  - [useContext](#useContext)
  - [useEffect](#useEffect)
  - [useMemo](#useMemo)
  - [useCallback](#useCallback)

## Installation

```sh
npm install fuco
# or use yarn
yarn add fuco
```

## Hooks

- Original Hooks

  - [useAttribute](#useAttribute)
  - [useProperty](#useProperty)
  - [useDispatchEvent](#useDispatchEvent)
  - [useStyle](#useStyle)

- React Hooks compatible

  - [useState](#useState)
  - [useReducer](#useReducer)
  - [useRef](#useRef)
  - [useContext](#useContext)
  - [useEffect](#useEffect)
  - [useLayoutEffect](#useLayoutEffect)
  - [useMemo](#useMemo)
  - [useCallback](#useCallback)

### useAttribute

`useAttribute` returens attribute value, and updates the component when the attribute specified by the first argument is changed.

```js
defineElement("greet-element", () => {
  const name = useAttribute("name");
  const hidden = useAttribute("hidden", value => value != null);
  if (hidden) {
    return html``;
  }
  return html`
    <div>Hello, ${name}</div>
  `;
});

html`
  <greet-element name="World"></greet-element>
`;
// => `<div>Hello, World</div>`

html`
  <greet-element name="WebComponent" hidden></greet-element>
`;
// => ``
```

### useProperty

`useProperty` returns element's property value, and updates the component when the property values is changed.

```js
defineElement("card-element", () => {
  const card = useProperty("card");
  return html`
    <div>${card.mark} ${card.value}</div>
  `;
});

const heartAce = { mark: "♥", value: 1 };
html`
  <card-element .card=${heartAce}></card-element>
`;
```

### useDispatchEvent

`useDispatchEvent` offers `dispatch` function like `dispatchEvent` to use CustomEvent.

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

// You can listen custom event using `@` prefix.
html`
  <send-message @some-message=${e => console.log(e.detail)}></send-message>
`;
```

### useStyle

`useStyle` can adapt a StyleSheet to the component.

```js
function HelloWorld() {
  useStyle(
    () => css`
      div {
        color: red;
      }
    `
  );
  return html`
    <div>Hello, world</div>
  `;
}
```

### useState

`useState` returns a pair of state and setter function, and upadates the component by updating state using setter function.

```js
function Counter() {
  const [count, setCount] = useState(0);
  return html`
    <div>${count}</div>
    <button @click=${() => setCount(count + 1)}>PLUS</button>
  `;
}
```

### useReducer

`useReducer` returns a pair of state and dispatch function.

```js
function Counter() {
  const [count, dispatch] = useReducer((state, action) => state + action, 0);
  return html`
    <div>${count}</div>
    <button @click=${() => dispatch(1)}>PLUS</button>
  `;
}
```

### useRef

`useRef` returned a ref object like React's, and you can recieve a DOM by setting ref object to attribute.

```js
function Input() {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  return html`
    <input :ref=${inputRef} />
    <button @click=${() => setValue(inputRef.current.value)}>push</button>
  `;
}
```

### useContext

`createContext` offers `Context`, and using`Context.defineProvider` to define provider, and you can consume it using `useContext(Context)`.

```js
const ThemeContext = createContext();

// define a custom element as Provider
ThemeContext.defineProvider("theme-provider");

const App = () => html`
  <theme-provider .value=${"dark"}>
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

### useEffect

`useEffect` gives you a side effects. it will run after rendering the component.

```js
function Timer() {
  useEffect(() => {
    const id = setInterval(() => console.log("interval"));
    return () => clearInterval(id);
  }, []);
  return html``;
}
```

### useLayoutEffect

`useLayoutEffect` runs after the DOM has been updated, but before the browser has had a chance to paint those changes

```js
function Box() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    ref.current.style.top = "100px";
  });
  return html`
    <div :ref=${ref}></div>
  `;
}
```

### useMemo

`useMemo` returns a memorized value. the value will update when deps given as the second argument.

```js
function Plus() {
  const value = useMemo(() => a + b, [a, b]);
  return html`
    ${value}
  `;
}
```

### useCallback

`useCallback` returns memorized callback as same as `useMemo`.

```js
function Greet() {
  const greet = useCallback(() => alert("Hello"));
  return html`
    <button @click=${greet}>hello</button>
  `;
}
```

## License

MIT
