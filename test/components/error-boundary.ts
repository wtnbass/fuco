import { html, defineElement, useErrorBoundary } from "../../src";

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
