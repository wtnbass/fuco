import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import "./components/error-boundary";
import "./components/error-button";

describe("use-error-boundary", () => {
  let target: Element;
  let slot: HTMLSlotElement;
  let div: HTMLDivElement;

  const setup = async () => {
    await waitFor();
    target = selectFixture("error-boundary");
    slot = target.shadowRoot.querySelector("slot");
    div = target.shadowRoot.querySelector("div");
  };

  beforeEach(() => {
    mountFixture(`
      <error-boundary>
        <error-button></error-button>
      </error-boundary>
    `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("occuered error", async () => {
    await setup();
    expect(slot).not.toBeNull();
    expect(div).toBeNull();

    const nodes = slot.assignedNodes().filter(n => n.nodeType === 1);
    const button = (nodes[0] as Element).shadowRoot.querySelector("button");
    button.click();

    await setup();

    expect(slot).toBeNull();
    expect(div.textContent.trim()).toEqual("oops!");
  });
});
