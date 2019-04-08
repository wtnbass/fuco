import { html, defineElement, useState } from "../../src";

function ErrorButton() {
  const [error, setError] = useState(false);
  if (error) throw new DOMException("oops!");
  return html`
    <button @click=${() => setError(true)}>Error!</button>
  `;
}

defineElement("error-button", ErrorButton);
