import { html, defineElement, useAttribute } from "../lib";

function Hello() {
  const name = useAttribute("name");
  return html`
    <div>Hello, ${name}</div>
  `;
}

defineElement("hello-world", Hello);
