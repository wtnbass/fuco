import { html, defineElement, useQueryAll, useState } from "../lib";

function Show() {
  const [value, set] = useState("");
  const inputs = useQueryAll<HTMLInputElement>(".input");
  const change = () => {
    set(
      Array.from(inputs.current)
        .map(input => input.value)
        .join(" ")
    );
  };

  return html`
    <input type="text" class="input" @keyup=${change} />
    <input type="text" class="input" @keyup=${change} />
    <input type="text" class="input" @keyup=${change} />
    <div>${value}</div>
  `;
}

defineElement("show-inputs", Show);
