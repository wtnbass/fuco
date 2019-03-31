import { html, defineElement } from "../lib";

import "./show-inputs";

function Query() {
  return html`
    <h2>Query</h2>
    <show-inputs></show-inputs>
  `;
}

defineElement("queryall-demo", Query);
