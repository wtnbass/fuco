import { html, defineElement, useState } from "../lib";

function Counter() {
  const [count, setCount] = useState(0);
  return html`
    <div>${count}</div>
    <button @click=${() => setCount(count + 1)}>+</button>
    <button @click=${() => setCount(count - 1)}>-</button>
  `;
}

defineElement("counter-app", Counter);
