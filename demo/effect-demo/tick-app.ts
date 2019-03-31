import { html, defineElement, useEffect, useState } from "../lib";

function Tick() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);

    return () => clearInterval(id);
  });

  return html`
    <div>${time}</div>
  `;
}

defineElement("tick-app", Tick);
