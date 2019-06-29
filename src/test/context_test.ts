/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { withFixtures, selector, selectorAll, text } from "./fixture";
import {
  html,
  defineElement,
  createContext,
  useRef,
  useState,
  useContext,
  useCallback
} from "..";

type Theme = "light" | "dark";
type Theme2 = "green" | "red";

const ThemeContext = createContext<Theme>();
ThemeContext.defineProvider("theme-context");
defineElement("theme-consumer", () => {
  const theme = useContext(ThemeContext);
  return html`
    <div>
      Theme is ${theme}.
    </div>
  `;
});

const Theme2Context = createContext<Theme2>();
Theme2Context.defineProvider("theme2-context");
defineElement("theme2-consumer", () => {
  const theme = useContext(Theme2Context) || "";
  const theme2 = useContext(Theme2Context) || "";
  return html`
    <div>
      Theme2 is ${theme + theme2}.
    </div>
  `;
});

defineElement("theme-consumer-count", () => {
  useContext(ThemeContext);
  const count = useRef(0);

  return html`
    <div>${count.current!++}</div>
  `;
});
function Single() {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = useCallback(() => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  }, []);

  return html`
    <button @click=${toggle}>change theme</button>
    <theme-context .value=${theme}>
      <theme-consumer></theme-consumer>
    </theme-context>
  `;
}

function Double() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [theme2, setTheme2] = useState<Theme2>("red");
  const toggle = useCallback(() => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  }, []);
  const toggle2 = useCallback(() => {
    setTheme2(t => (t === "red" ? "green" : "red"));
  }, []);

  return html`
  <button @click=${toggle}>change theme</button>
  <button @click=${toggle2}>change theme2</button>
  <theme-context .value=${theme}>
    <theme2-context .value=${theme2}>
      <theme-consumer></theme-consumer>
      <theme2-consumer></theme-consumer>
    </theme2-context>
  </theme-context>
`;
}

function Same() {
  const [theme, setTheme] = useState<Theme2>("red");
  const toggle = useCallback(() => {
    setTheme(t => (t === "red" ? "green" : "red"));
  }, []);
  const [theme2, setTheme2] = useState<Theme2>("red");
  const toggle2 = useCallback(() => {
    setTheme2(t => (t === "red" ? "green" : "red"));
  }, []);

  return html`
    <button @click=${toggle}>change theme</button>
    <button @click=${toggle2}>change theme</button>
    <theme2-context .value=${theme}>
      <theme2-consumer></theme2-consumer>
    </theme2-context>
    <theme2-context .value=${theme2}>
      <theme2-consumer></theme2-consumer>
    </theme2-context>
  `;
}

function Duplicate() {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = useCallback(() => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  }, []);
  const [theme2, setTheme2] = useState<Theme>("dark");
  const toggle2 = useCallback(() => {
    setTheme2(t => (t === "dark" ? "light" : "dark"));
  }, []);

  return html`
    <button @click=${toggle}>change theme</button>
    <button @click=${toggle2}>change theme</button>
    <theme-context .value=${theme}>
      <theme-consumer></theme-consumer>
      <theme-context .value=${theme2}>
        <theme-consumer></theme-consumer>
      </theme-context>
    </theme-context>
  `;
}

function Unsubscribe() {
  const [show, setShow] = useState(true);

  return html`
    <button @click=${() => setShow(false)}>change</button>
    <theme-context .value=${"dark"}>
      ${show
        ? html`
            <theme-consumer></theme-consumer>
          `
        : html``}
    </theme-context>
  `;
}

function ValueChanged() {
  const provier = useRef<Element & { value: Theme }>(null);
  const setValue = useCallback((theme: Theme) => {
    provier.current!.value = theme;
  }, []);

  return html`
    <button @click=${() => setValue("light")}>light</button>
    <button @click=${() => setValue("dark")}>dark</button>
    <theme-context .value=${"dark"} ref=${provier}>
      <theme-consumer-count></theme-consumer-count>
    </theme-context>
  `;
}

describe(
  "use-context",
  withFixtures(Single, Double, Same, Duplicate, Unsubscribe, ValueChanged)(
    fixs => {
      it("single context", async () => {
        let target!: Element;
        let button!: HTMLButtonElement;
        let consumer!: Element;
        let inner!: HTMLDivElement;

        const setup = async () => {
          target = await fixs[0].setup();
          button = selector("button", target);
          consumer = selector("theme-consumer", target);
          inner = selector("div", consumer);
        };

        await setup();
        expect(text(inner)).toEqual("Theme is dark.");

        button.click();

        await setup();
        expect(text(inner)).toEqual("Theme is light.");
      });

      it("double contexts", async () => {
        let target!: Element;
        let button1!: HTMLButtonElement;
        let button2!: HTMLButtonElement;
        let consumer1!: Element;
        let consumer2!: Element;
        let inner1!: HTMLDivElement;
        let inner2!: HTMLDivElement;

        const setup = async () => {
          target = await fixs[1].setup();
          [button1, button2] = selectorAll<HTMLButtonElement>("button", target);
          consumer1 = selector("theme-consumer", target);
          consumer2 = selector("theme2-consumer", target);
          inner1 = selector("div", consumer1);
          inner2 = selector("div", consumer2);
        };
        await setup();
        expect(text(inner1)).toEqual("Theme is dark.");
        expect(text(inner2)).toEqual("Theme2 is redred.");

        button1.click();

        await setup();
        expect(text(inner1)).toEqual("Theme is light.");
        expect(text(inner2)).toEqual("Theme2 is redred.");

        button2.click();

        await setup();
        expect(text(inner1)).toEqual("Theme is light.");
        expect(text(inner2)).toEqual("Theme2 is greengreen.");
      });

      it("same contexts", async () => {
        let target!: Element;
        let button1!: HTMLButtonElement;
        let button2!: HTMLButtonElement;
        let consumer1!: Element;
        let consumer2!: Element;
        let inner1!: HTMLDivElement;
        let inner2!: HTMLDivElement;

        const setup = async () => {
          target = await fixs[2].setup();
          [button1, button2] = selectorAll<HTMLButtonElement>("button", target);
          [consumer1, consumer2] = selectorAll("theme2-consumer", target);
          inner1 = selector("div", consumer1);
          inner2 = selector("div", consumer2);
        };
        await setup();
        expect(text(inner1)).toEqual("Theme2 is redred.");
        expect(text(inner2)).toEqual("Theme2 is redred.");

        button1.click();

        await setup();
        expect(text(inner1)).toEqual("Theme2 is greengreen.");
        expect(text(inner2)).toEqual("Theme2 is redred.");

        button2.click();

        await setup();
        expect(text(inner1)).toEqual("Theme2 is greengreen.");
        expect(text(inner2)).toEqual("Theme2 is greengreen.");
      });

      it("duplicate contexts", async () => {
        let target!: Element;
        let button1!: HTMLButtonElement;
        let button2!: HTMLButtonElement;
        let consumer1!: Element;
        let consumer2!: Element;
        let inner1!: HTMLDivElement;
        let inner2!: HTMLDivElement;

        const setup = async () => {
          target = await fixs[3].setup();
          [button1, button2] = selectorAll<HTMLButtonElement>("button", target);
          [consumer1, consumer2] = selectorAll("theme-consumer", target);
          inner1 = selector("div", consumer1);
          inner2 = selector("div", consumer2);
        };
        await setup();
        expect(text(inner1)).toEqual("Theme is dark.");
        expect(text(inner2)).toEqual("Theme is dark.");

        button1.click();

        await setup();
        expect(text(inner1)).toEqual("Theme is light.");
        expect(text(inner2)).toEqual("Theme is dark.");

        button2.click();

        await setup();
        expect(text(inner1)).toEqual("Theme is light.");
        expect(text(inner2)).toEqual("Theme is light.");
      });

      it("unsubscribe when consumer is unmounted", async () => {
        let target!: Element;
        let provider!: Element & { consumers: Set<unknown> };
        let button!: HTMLButtonElement;
        const setup = async () => {
          target = await fixs[4].setup();
          provider = selector("theme-context", target);
          button = selector("button", target);
        };
        await setup();
        expect(provider.consumers.size).toEqual(1);

        button.click();

        await setup();
        expect(provider.consumers.size).toEqual(0);
      });

      it("count value changed", async () => {
        let target!: Element;
        let light!: HTMLButtonElement;
        let dark!: HTMLButtonElement;
        let count!: HTMLDivElement;
        const setup = async () => {
          target = await fixs[5].setup();
          [light, dark] = selectorAll<HTMLButtonElement>("button", target);
          const consumer = selector("theme-consumer-count", target);
          count = selector("div", consumer);
        };
        await setup();
        expect(text(count)).toEqual("0");

        light.click();

        await setup();
        expect(text(count)).toEqual("1");

        light.click();

        await setup();
        expect(text(count)).toEqual("1");

        dark.click();

        await setup();
        expect(text(count)).toEqual("2");
      });
    }
  )
);
