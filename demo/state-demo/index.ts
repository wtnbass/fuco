import { html, defineElement } from "../lib";

import "./counter-app";

function State() {
  return html`
    <h2>State</h2>
    <counter-app></counter-app>
  `;
}
defineElement("state-demo", State);
