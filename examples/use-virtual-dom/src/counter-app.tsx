import { h, defineElement, useState } from "./vdom";

const style = {
  fontFamily: "sans-serif",
  textAlign: "center"
};

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div style={style}>
      <div>{count}</div>
      <button onclick={() => setCount(count + 1)}>+</button>
      <button onclick={() => setCount(count - 1)}>-</button>
    </div>
  );
}

defineElement("counter-app", Counter);
