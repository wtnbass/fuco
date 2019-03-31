import { html, defineElement } from "../lib";

import "./full-name";

function Memo() {
  return html`
    <h2>Memo</h2>
    <full-name></full-name>
  `;
}

defineElement("memo-demo", Memo);
