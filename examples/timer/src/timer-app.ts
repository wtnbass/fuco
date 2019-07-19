import { html, defineElement, useState, useEffect } from "fuco";

function Timer() {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTime(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  return html`
    <style>
      :host {
        text-align: center;
      }
    </style>
    <div>${new Date(time).toLocaleTimeString()}</div>
  `;
}

defineElement("timer-app", Timer);
