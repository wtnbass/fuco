import { withFixture, selector, waitFor } from "./fixture";
import { html, defineElement, useDispatchEvent, useCallback } from "..";

let recievedMessage = "";

const fixture = () => {
  const recieve = useCallback((e: CustomEvent<string>) => {
    recievedMessage = e.detail;
  });
  return html`
    <event-sender @send-event=${recieve}></event-sender>
  `;
};

describe(
  "use-dispatch-event",
  withFixture(fixture, name => {
    let target: Element;
    let sender: Element;
    let button: HTMLButtonElement;

    const setup = async () => {
      await waitFor();
      target = selector(name);
      sender = selector("event-sender", target);
      button = selector("button", sender);
    };

    beforeAll(() => {
      defineElement("event-sender", () => {
        const dispatch = useDispatchEvent<string>("send-event");
        return html`
          <button @click=${() => dispatch("Hello!!!")}>click</button>
        `;
      });
    });

    beforeEach(() => {
      recievedMessage = "";
    });

    it("dispatch event", async () => {
      await setup();
      button.click();

      await setup();
      expect(recievedMessage).toEqual("Hello!!!");
    });
  })
);
