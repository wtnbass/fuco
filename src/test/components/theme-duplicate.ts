import { html, defineElement, useState, useCallback } from "../..";
import { Theme } from "./theme-context";

import "./theme-context";
import "./theme-consumer";

function Context() {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = useCallback(() => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  });
  const [theme2, setTheme2] = useState<Theme>("dark");
  const toggle2 = useCallback(() => {
    setTheme2(t => (t === "dark" ? "light" : "dark"));
  });

  return html`
    <button @click=${toggle}>change theme</button>
    <button @click=${toggle2}>change theme</button>
    <theme-context .value=${theme}>
      <theme-consumer></theme-consumer>
      <theme-context .value=${theme2}>
        <theme-consumer></theme-consumer>
      </theme-context>
    </theme-context>
  `;
}

defineElement("theme-duplicate", Context);
