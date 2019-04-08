import { html, defineElement, useAttribute } from "../../src";

function Hello() {
  const name = useAttribute("name");
  return html`
    <div>Hello, ${name}</div>
  `;
}

defineElement("hello-world", Hello);
