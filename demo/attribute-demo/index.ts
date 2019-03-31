import { html, defineElement, useState, useCallback } from "../lib";

import "./hello-world";

function Attribute() {
  const [name, setName] = useState("");
  const input = useCallback((e: KeyboardEvent) => {
    setName((e.target as HTMLInputElement).value);
  });

  return html`
    <h2>Attribute</h2>
    <input type="text" @keyup=${input} />
    <hello-world name=${name}></hello-world>
  `;
}

defineElement("attribute-demo", Attribute);
