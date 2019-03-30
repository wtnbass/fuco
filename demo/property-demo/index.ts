import { html, defineElement, useState, useCallback } from "../lib";

import "./user-info";
import { User } from "./user-info";

function Property() {
  const [name, setName] = useState("Alice");
  const [age, setAge] = useState(18);
  const input = useCallback((fn: (value: string) => void) => (e: Event) => {
    fn((e.target as HTMLInputElement).value);
  });

  const user: User = { name, age };

  return html`
    <h2>Property</h2>
    <div>
      <label>Name</label>
      <input type="text" .value=${name} @input=${input(setName)} />
    </div>
    <div>
      <label>Age</label>
      <input
        type="text"
        .value=${isNaN(age) ? "" : age}
        @input=${input(n => setAge(+n))}
      />
    </div>
    <div>
      <user-info .user=${user}></user-info>
    </div>
  `;
}

defineElement("property-demo", Property);
