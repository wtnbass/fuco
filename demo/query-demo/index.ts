import { html, defineElement } from "../lib";

import "./show-input";

function Query() {
  return html`
    <h2>Query</h2>
    <show-input></show-input>
  `;
}

defineElement("query-demo", Query);
