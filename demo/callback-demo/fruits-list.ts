import { html, defineElement, useCallback, useState } from "../lib";

function Fruits() {
  const [fruits, add] = useState([]);
  const addApple = useCallback(() => {
    add([...fruits, "Apple"]);
  }, [fruits]);

  return html`
    <button @click=${addApple}>Add Apple</button>
    ${fruits.map(
      fruit => html`
        <div>${fruit}</div>
      `
    )}
  `;
}

defineElement("fruits-list", Fruits);
