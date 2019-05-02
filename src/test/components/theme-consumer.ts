import { html, defineElement, useContext } from "../..";
import { ThemeContext } from "./theme-context";

function Consumer() {
  const theme = useContext(ThemeContext);
  return html`
    <div>
      Theme is ${theme}.
    </div>
  `;
}

defineElement("theme-consumer", Consumer);
