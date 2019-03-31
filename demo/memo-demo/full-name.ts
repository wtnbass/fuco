import { html, defineElement, useMemo, useState } from "../lib";

const input = (fn: Function) => (e: KeyboardEvent) => {
  const el = e.target as HTMLInputElement;
  fn(el.value);
};

function FullName() {
  const [firstName, setFirst] = useState("John");
  const [lastName, setLast] = useState("Smith");
  const [age, setAge] = useState("23");

  const fullName = useMemo(() => {
    return firstName + " " + lastName;
  }, [firstName, lastName]);

  return html`
    <input type="text" .value=${firstName} @keyup=${input(setFirst)} />
    <input type="text" .value=${lastName} @keyup=${input(setLast)} />
    <input type="text" .value=${age} @keyup=${input(setAge)} />
    <div>${fullName} (${age})</div>
  `;
}

defineElement("full-name", FullName);
