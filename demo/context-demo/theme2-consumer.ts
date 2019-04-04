import { html, defineElement, useContext } from "../lib";
import { Theme2Context } from "./theme2-context";

function Consumer() {
  const theme = useContext(Theme2Context);
  const theme2 = useContext(Theme2Context);
  const theme3 = useContext(Theme2Context);
  return html`
    <div>
      Theme2 is ${theme + theme2 + theme3}.
    </div>
  `;
}

defineElement("theme2-consumer", Consumer);
