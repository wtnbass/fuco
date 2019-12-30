import { expect } from "chai";
import { withFixtures, selector } from "./fixture";
import { html, defineElement, useDispatchEvent, useCallback } from "..";

let recievedMessage = "";

const fixture = () => {
  const recieve = useCallback((e: CustomEvent<string>) => {
    recievedMessage = e.detail;
  }, []);
  return html`
    <event-sender @send-event=${recieve}></event-sender>
  `;
};

describe(
  "use-dispatch-event",
  withFixtures(fixture)(([f]) => {
    let target: Element;
    let sender: Element;
    let button: HTMLButtonElement;

    const setup = async () => {
      target = await f.setup();
      sender = selector("event-sender", target);
      button = selector("button", sender);
    };

    before(() => {
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
      expect(recievedMessage).to.equal("Hello!!!");
    });
  })
);
