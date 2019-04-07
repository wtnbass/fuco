import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import "./components/theme-app";
import "./components/theme-double";
import "./components/theme-same";

describe("use-context", () => {
  let target1: Element;
  let target2: Element;
  let target3: Element;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let consumer1: Element;
  let consumer2: Element;
  let inner1: HTMLDivElement;
  let inner2: HTMLDivElement;

  const setup1 = () => {
    target1 = selectFixture("theme-app");
    button1 = target1.shadowRoot.querySelector("button");
    consumer1 = target1.shadowRoot.querySelector("theme-consumer");
    inner1 = consumer1.shadowRoot.querySelector("div");
  };

  const setup2 = () => {
    target2 = selectFixture("theme-double");
    [button1, button2] = target2.shadowRoot.querySelectorAll("button");
    consumer1 = target2.shadowRoot.querySelector("theme-consumer");
    consumer2 = target2.shadowRoot.querySelector("theme2-consumer");
    inner1 = consumer1.shadowRoot.querySelector("div");
    inner2 = consumer2.shadowRoot.querySelector("div");
  };

  const setup3 = () => {
    target3 = selectFixture("theme-same");
    [button1, button2] = target3.shadowRoot.querySelectorAll("button");
    [consumer1, consumer2] = target3.shadowRoot.querySelectorAll(
      "theme2-consumer"
    );
    inner1 = consumer1.shadowRoot.querySelector("div");
    inner2 = consumer2.shadowRoot.querySelector("div");
  };

  beforeEach(() => {
    mountFixture(`
      <theme-app></theme-app>
      <theme-double></theme-double>
      <theme-same></theme-same>
      `);
  });

  afterEach(() => {
    unmountFixture();
  });

  it("single context", async () => {
    setup1();
    expect(inner1.textContent.trim()).toEqual("Theme is dark.");

    button1.click();
    await waitFor();
    expect(inner1.textContent.trim()).toEqual("Theme is light.");
  });

  it("double contexts", async () => {
    setup2();
    expect(inner1.textContent.trim()).toEqual("Theme is dark.");
    expect(inner2.textContent.trim()).toEqual("Theme2 is redred.");

    button1.click();
    await waitFor();
    expect(inner1.textContent.trim()).toEqual("Theme is light.");
    expect(inner2.textContent.trim()).toEqual("Theme2 is redred.");

    button2.click();
    await waitFor();
    expect(inner1.textContent.trim()).toEqual("Theme is light.");
    expect(inner2.textContent.trim()).toEqual("Theme2 is greengreen.");
  });

  it("same contexts", async () => {
    setup3();
    expect(inner1.textContent.trim()).toEqual("Theme2 is redred.");
    expect(inner2.textContent.trim()).toEqual("Theme2 is redred.");

    button1.click();
    await waitFor();
    expect(inner1.textContent.trim()).toEqual("Theme2 is greengreen.");
    expect(inner2.textContent.trim()).toEqual("Theme2 is redred.");

    button2.click();
    await waitFor();
    expect(inner1.textContent.trim()).toEqual("Theme2 is greengreen.");
    expect(inner2.textContent.trim()).toEqual("Theme2 is greengreen.");
  });
});
