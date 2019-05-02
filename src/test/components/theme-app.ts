import { html, defineElement, useState, useCallback } from "../..";
import { Theme } from "./theme-context";

import "./theme-context";
import "./theme-consumer";

function Context() {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = useCallback(() => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  });

  return html`
    <button @click=${toggle}>change theme</button>
    <theme-context .value=${theme}>
      <theme-consumer></theme-consumer>
    </theme-context>
  `;
}

defineElement("theme-app", Context);
