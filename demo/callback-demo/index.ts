import { html, defineElement } from "../lib";

import "./fruits-list";

function Callback() {
  return html`
    <h2>Callback</h2>
    <fruits-list></fruits-list>
  `;
}

defineElement("callback-demo", Callback);
