import { html, defineElement } from "../lib";

import "./todo-app";

function Reducer() {
  return html`
    <h2>Reducer</h2>
    <todo-app></todo-app>
  `;
}

defineElement("reducer-demo", Reducer);
