import { html, defineElement, useState, useCallback } from "../lib";
import { Theme } from "./theme-context";
import { Theme2 } from "./theme2-context";

import "./theme-context";
import "./theme-consumer";
import "./theme2-context";
import "./theme2-consumer";

function Condition(t1: Theme, t2: Theme2) {
  return t1 === "light" && t2 === "red"
    ? html`
        <theme-consumer></theme-consumer>
      `
    : html``;
}

function Context() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [theme2, setTheme2] = useState<Theme2>("red");
  const toggle = useCallback(() => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  });
  const toggle2 = useCallback(() => {
    setTheme2(t => (t === "red" ? "green" : "red"));
  });

  return html`
    <h2>Context</h2>
    <button @click=${toggle}>change theme</button>
    <button @click=${toggle2}>change theme2</button>
    <theme-context .value=${theme}>
      <theme2-context .value=${theme2}>
        ${Condition(theme, theme2)}
        <theme-consumer></theme-consumer>
        <theme2-consumer></theme-consumer>
      </theme2-context>
    </theme-context>
  `;
}

defineElement("context-demo", Context);
