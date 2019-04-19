# functional-web-component

[![npm](https://img.shields.io/npm/v/functional-web-component.svg)](https://www.npmjs.com/package/functional-web-component)

Functional Component like React, but for Web Components.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Counter</title>
  <head>
  <body>
    <counter-app></counter-app>
    <script type="module">
      import { html, defineElement, useState } from 'https://unpkg.com/functional-web-component?module';

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

## Installation

```sh
npm install functional-web-component
# or use yarn
yarn add functional-web-component
```

## Hooks

### useAttribute

As same as `getAttribute`, but `useAttribute` updates the component when the value of the specified attribute changes.

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

// Use it like:
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

// You can listen custom event using `@` prefix like:
html`
  <send-message @some-message=${e => console.log(e.detail)}></send-message>
`;
```
