import { html, defineElement, useQueryAll, useState } from "../../src";

function capitalize(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

function InputJoin() {
  const [value, setValue] = useState("");
  const ref = useQueryAll<HTMLInputElement>(".input");
  const change = () => {
    const [first, second] = ref.current;
    setValue(capitalize(first.value) + capitalize(second.value));
  };

  return html`
    <input type="text" class="input" @keyup=${change} />
    <input type="text" class="input" @keyup=${change} />
    <div>${value}</div>
  `;
}

defineElement("input-join", InputJoin);
