import { html, defineElement, useState } from "../lib";

import "./tick-app";

function Effect() {
  const [show, setShow] = useState(true);

  return html`
    <h2>Effect</h2>
    <button @click=${() => setShow(!show)}>
      ${show ? "hide" : "show"}
    </button>
    <div>
      ${show
        ? html`
            <tick-app></tick-app>
          `
        : ""}
    </div>
  `;
}

defineElement("effect-demo", Effect);
