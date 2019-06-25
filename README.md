# functional-web-component

[![npm](https://img.shields.io/npm/v/functional-web-component.svg)](https://www.npmjs.com/package/functional-web-component)
[![install size](https://packagephobia.now.sh/badge?p=functional-web-component)](https://packagephobia.now.sh/result?p=functional-web-component)
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
      } from "//unpkg.com/functional-web-component?module";

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
  - [useSelector](#useSelector)
  - [useDispatchEvent](#useDispatchEvent)
  - [useStyle](#useStyle)
  - [useRef](#useRef)
  - [useContext](#useContext)

## Installation

```sh
npm install functional-web-component
# or use yarn
yarn add functional-web-component
```

## Hooks

- Original Hooks

  - [useAttribute](#useAttribute)
  - [useProperty](#useProperty)
  - [useDispatchEvent](#useDispatchEvent)
  - [useStyle](#useStyle)

- React Hooks compatible

  - [useRef](#useRef)
  - useState
  - useReducer
  - [useContext](#useContext)
  - useEffect
  - useMemo
  - useCallback

### useAttribute

As same as `getAttribute`, but `useAttribute` updates the component when the value of the specified attribute changes.

```js
defineElement("greet-element", () => {
  const name = useAttribute("name");
  const hidden = useAttribute("hidden", value => value != null);
  if (hidden) {
    return html``;
  }
  return html`
    <div>Hello, ${name}!</div>
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

If you use `useAttribute`, you can only receive string type values.
Using `useProperty` allow to recieve node's Javascript property value and update the component when the value of this property changes.

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

// You can listen custom event using `@` prefix.
html`
  <send-message @some-message=${e => console.log(e.detail)}></send-message>
`;
```

### useStyle

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

### useRef

You can use ref like React by setting value returned by `useRef` to attribute.

```js
function Input() {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  return html`
    <input ref=${inputRef} />
    <button @click=${() => setValue(inputRef.current.value)}>push</button>
  `;
}
```

### useContext

`createContext` offers `Context`, and using`Context.defineProvider` to define provider.

You can consume it using `useContext(Context)`.

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

## License

MIT
