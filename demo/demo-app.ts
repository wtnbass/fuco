import { html, defineElement } from "./lib";

import "./attribute-demo";
import "./property-demo";
import "./query-demo";
import "./queryall-demo";
import "./state-demo";
import "./reducer-demo";
import "./context-demo";
import "./effect-demo";
import "./memo-demo";
import "./callback-demo";

function Demo() {
  return html`
    <h1>Demo</h1>
    <attribute-demo></attribute-demo>
    <property-demo></property-demo>
    <query-demo></query-demo>
    <queryall-demo></queryall-demo>
    <state-demo></state-demo>
    <reducer-demo></reducer-demo>
    <context-demo></context-demo>
    <effect-demo></effect-demo>
    <memo-demo></memo-demo>
    <callback-demo></callback-demo>
  `;
}

defineElement("demo-app", Demo);
