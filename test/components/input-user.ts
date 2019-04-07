import { html, defineElement, useState, useCallback } from "../../src";

import "./user-info";

export interface User {
  name: string;
  age: string;
}

function InputUser() {
  const [name, setName] = useState("Alice");
  const [age, setAge] = useState("18");
  const input = useCallback((fn: (value: string) => void) => (e: Event) => {
    fn((e.target as HTMLInputElement).value);
  });

  const user: User = { name, age };

  return html`
    <input type="text" .value=${name} @keyup=${input(setName)} />
    <input type="text" .value=${age} @keyup=${input(setAge)} />
    <user-info .user=${user}></user-info>
  `;
}

defineElement("input-user", InputUser);
