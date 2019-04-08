import { html, defineElement, useQuery, useState } from "../../src";

function Show() {
  const [value, set] = useState("");
  const input = useQuery<HTMLInputElement>("#input");

  return html`
    <input type="text" id="input" @keyup=${() => set(input.current.value)} />
    <div>${value}</div>
  `;
}

defineElement("show-input", Show);
