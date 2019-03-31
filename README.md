# functional-web-component

[![npm](https://img.shields.io/npm/v/functional-web-component.svg)](https://www.npmjs.com/package/functional-web-component)

WebComponents with lit-html and Hooks

## Short Example

Define a component using `useState`.

```js
function Counter() {
  const [count, setCount] = useState(0);
  return html`
    <div>${count}</div>
    <button @click=${() => setCount(c => c + 1)}>+</button>
    <button @click=${() => setCount(c => c - 1)}>-</button>
  `;
}

defineElement("counter-app", Counter);
```
