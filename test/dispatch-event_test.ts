import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";
import { html, defineElement, useDispatchEvent, useCallback } from "../src";

describe("use-dispatch-event", () => {
  let target: Element;
  let sender: Element;
  let button: HTMLButtonElement;
  let recievedMessage = "";

  const setup = async () => {
    await waitFor();
    target = selectFixture("event-reciever");
    sender = target.shadowRoot.querySelector("event-sender");
    button = sender.shadowRoot.querySelector("button");
  };

  beforeAll(() => {
    defineElement("event-reciever", () => {
      const recieve = useCallback((e: CustomEvent<string>) => {
        recievedMessage = e.detail;
      });
      return html`
        <event-sender @send-event=${recieve}></event-sender>
      `;
    });
    defineElement("event-sender", () => {
      const dispatch = useDispatchEvent<string>("send-event");
      return html`
        <button @click=${() => dispatch("Hello!!!")}>click</button>
      `;
    });
  });

  beforeEach(() => {
    recievedMessage = "";
    mountFixture(`
      <event-reciever></event-reciever>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("dispatch event", async () => {
    await setup();
    button.click();

    await setup();
    expect(recievedMessage).toEqual("Hello!!!");
  });
});
