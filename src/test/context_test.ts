import {
  mountFixture,
  unmountFixture,
  selectFixture,
  selector,
  selectorAll,
  text,
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

  const setup1 = async () => {
    await waitFor();
    target = selectFixture("theme-app");
    button1 = selector("button", target);
    consumer1 = selector("theme-consumer", target);
    inner1 = selector("div", consumer1);
  };

  const setup2 = async () => {
    await waitFor();
    target = selectFixture("theme-double");
    [button1, button2] = selectorAll<HTMLButtonElement>("button", target);
    consumer1 = selector("theme-consumer", target);
    consumer2 = selector("theme2-consumer", target);
    inner1 = selector("div", consumer1);
    inner2 = selector("div", consumer2);
  };

  const setup3 = async () => {
    await waitFor();
    target = selectFixture("theme-same");
    [button1, button2] = selectorAll<HTMLButtonElement>("button", target);
    [consumer1, consumer2] = selectorAll("theme2-consumer", target);
    inner1 = selector("div", consumer1);
    inner2 = selector("div", consumer2);
  };
  const setup4 = async () => {
    await waitFor();
    target = selectFixture("theme-duplicate");
    [button1, button2] = selectorAll<HTMLButtonElement>("button", target);
    [consumer1, consumer2] = selectorAll("theme-consumer", target);
    inner1 = selector("div", consumer1);
    inner2 = selector("div", consumer2);
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
    await setup1();
    expect(text(inner1)).toEqual("Theme is dark.");

    button1.click();

    await setup1();
    expect(text(inner1)).toEqual("Theme is light.");
  });

  it("double contexts", async () => {
    await setup2();
    expect(text(inner1)).toEqual("Theme is dark.");
    expect(text(inner2)).toEqual("Theme2 is redred.");

    button1.click();

    await setup2();
    expect(text(inner1)).toEqual("Theme is light.");
    expect(text(inner2)).toEqual("Theme2 is redred.");

    button2.click();

    await setup2();
    expect(text(inner1)).toEqual("Theme is light.");
    expect(text(inner2)).toEqual("Theme2 is greengreen.");
  });

  it("same contexts", async () => {
    await setup3();
    expect(text(inner1)).toEqual("Theme2 is redred.");
    expect(text(inner2)).toEqual("Theme2 is redred.");

    button1.click();

    await setup3();
    expect(text(inner1)).toEqual("Theme2 is greengreen.");
    expect(text(inner2)).toEqual("Theme2 is redred.");

    button2.click();

    await setup3();
    expect(text(inner1)).toEqual("Theme2 is greengreen.");
    expect(text(inner2)).toEqual("Theme2 is greengreen.");
  });

  it("duplicate contexts", async () => {
    await setup4();
    expect(text(inner1)).toEqual("Theme is dark.");
    expect(text(inner2)).toEqual("Theme is dark.");

    button1.click();

    await setup4();
    expect(text(inner1)).toEqual("Theme is light.");
    expect(text(inner2)).toEqual("Theme is dark.");

    button2.click();

    await setup4();
    expect(text(inner1)).toEqual("Theme is light.");
    expect(text(inner2)).toEqual("Theme is light.");
  });
});
