import { html, defineElement, useState, useErrorBoundary } from "../lib";

function Error() {
  return html`
    <h2>Error Boundary</h2>
    <error-boundary>
      <error-button></error-button>
    </error-boundary>
  `;
}

defineElement("error-boundary-demo", Error);

function ErrorBoudary() {
  const error = useErrorBoundary();
  if (error) {
    return html`
      <div>${error.message}</div>
    `;
  }
  return html`
    <slot></slot>
  `;
}

defineElement("error-boundary", ErrorBoudary);

function ErrorButton() {
  const [error, setError] = useState(false);
  if (error) throw new DOMException("something occered!");
  return html`
    <button @click=${() => setError(true)}>Error!</button>
  `;
}

defineElement("error-button", ErrorButton);
