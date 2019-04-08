import { html, defineElement, useState, useCallback } from "../../src";
import { Theme2 } from "./theme2-context";

import "./theme2-context";
import "./theme2-consumer";

function Context() {
  const [theme, setTheme] = useState<Theme2>("red");
  const toggle = useCallback(() => {
    setTheme(t => (t === "red" ? "green" : "red"));
  });
  const [theme2, setTheme2] = useState<Theme2>("red");
  const toggle2 = useCallback(() => {
    setTheme2(t => (t === "red" ? "green" : "red"));
  });

  return html`
    <button @click=${toggle}>change theme</button>
    <button @click=${toggle2}>change theme</button>
    <theme2-context .value=${theme}>
      <theme2-consumer></theme2-consumer>
    </theme2-context>
    <theme2-context .value=${theme2}>
      <theme2-consumer></theme2-consumer>
    </theme2-context>
  `;
}

defineElement("theme-same", Context);
