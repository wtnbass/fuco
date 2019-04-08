import {
  mountFixture,
  unmountFixture,
  selectFixture,
  waitFor
} from "./helpers/fixture";

import "./components/theme-app";
import "./components/theme-double";
import "./components/theme-same";
import "./components/theme-duplicate";

describe("use-context", () => {
  let target: Element;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let consumer1: Element;
  let consumer2: Element;
  let inner1: HTMLDivElement;
  let inner2: HTMLDivElement;

  const setup1 = () => {
    target = selectFixture("theme-app");
    button1 = target.shadowRoot.querySelector("button");
    consumer1 = target.shadowRoot.querySelector("theme-consumer");
    inner1 = consumer1.shadowRoot.querySelector("div");
  };

  const setup2 = () => {
    target = selectFixture("theme-double");
    [button1, button2] = target.shadowRoot.querySelectorAll("button");
    consumer1 = target.shadowRoot.querySelector("theme-consumer");
    consumer2 = target.shadowRoot.querySelector("theme2-consumer");
    inner1 = consumer1.shadowRoot.querySelector("div");
    inner2 = consumer2.shadowRoot.querySelector("div");
  };

  const setup3 = () => {
    target = selectFixture("theme-same");
    [button1, button2] = target.shadowRoot.querySelectorAll("button");
    [consumer1, consumer2] = target.shadowRoot.querySelectorAll(
      "theme2-consumer"
    );
    inner1 = consumer1.shadowRoot.querySelector("div");
    inner2 = consumer2.shadowRoot.querySelector("div");
  };
  const setup4 = () => {
    target = selectFixture("theme-duplicate");
    [button1, button2] = target.shadowRoot.querySelectorAll("button");
    [consumer1, consumer2] = target.shadowRoot.querySelectorAll(
      "theme-consumer"
    );
    inner1 = consumer1.shadowRoot.querySelector("div");
    inner2 = consumer2.shadowRoot.querySelector("div");
  };

  beforeEach(() => {
    mountFixture(`
      <theme-app></theme-app>
      <theme-double></theme-double>
      <theme-same></theme-same>
      <theme-duplicate></theme-duplicate>
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

  it("duplicate contexts", async () => {
    setup4();
    expect(inner1.textContent.trim()).toEqual("Theme is dark.");
    expect(inner2.textContent.trim()).toEqual("Theme is dark.");

    button1.click();
    await waitFor();
    expect(inner1.textContent.trim()).toEqual("Theme is light.");
    expect(inner2.textContent.trim()).toEqual("Theme is dark.");

    button2.click();
    await waitFor();
    expect(inner1.textContent.trim()).toEqual("Theme is light.");
    expect(inner2.textContent.trim()).toEqual("Theme is light.");
  });
});
