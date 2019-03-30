import { html, defineElement } from "./lib";

import "./attribute-demo";
import "./property-demo";
import "./state-demo";
import "./reducer-demo";
import "./context-demo";

function Demo() {
  return html`
    <h1>Demo</h1>
    <attribute-demo></attribute-demo>
    <property-demo></property-demo>
    <state-demo></state-demo>
    <reducer-demo></reducer-demo>
    <context-demo></context-demo>
  `;
}

defineElement("demo-app", Demo);
