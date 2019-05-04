import { withFixture, selector, selectorAll, text, waitFor } from "./fixture";
import {
  html,
  defineElement,
  createContext,
  useState,
  useContext,
  useCallback
} from "..";

type Theme = "light" | "dark";
type Theme2 = "green" | "red";

describe("use-context", () => {
  let fixture;

  beforeAll(() => {
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
  });

  fixture = () => {
    const [theme, setTheme] = useState<Theme>("dark");
    const toggle = useCallback(() => {
      setTheme(t => (t === "dark" ? "light" : "dark"));
    });

    return html`
      <button @click=${toggle}>change theme</button>
      <theme-context .value=${theme}>
        <theme-consumer></theme-consumer>
      </theme-context>
    `;
  };

  describe(
    "single context",
    withFixture(fixture, name => {
      let target: Element;
      let button: HTMLButtonElement;
      let consumer: Element;
      let inner: HTMLDivElement;

      const setup = async () => {
        await waitFor();
        target = selector(name);
        button = selector("button", target);
        consumer = selector("theme-consumer", target);
        inner = selector("div", consumer);
      };

      it("single context", async () => {
        await setup();
        expect(text(inner)).toEqual("Theme is dark.");

        button.click();

        await setup();
        expect(text(inner)).toEqual("Theme is light.");
      });
    })
  );

  fixture = () => {
    const [theme, setTheme] = useState<Theme>("dark");
    const [theme2, setTheme2] = useState<Theme2>("red");
    const toggle = useCallback(() => {
      setTheme(t => (t === "dark" ? "light" : "dark"));
    });
    const toggle2 = useCallback(() => {
      setTheme2(t => (t === "red" ? "green" : "red"));
    });

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
  };

  describe(
    "double contexts",
    withFixture(fixture, name => {
      let target: Element;
      let button1: HTMLButtonElement;
      let button2: HTMLButtonElement;
      let consumer1: Element;
      let consumer2: Element;
      let inner1: HTMLDivElement;
      let inner2: HTMLDivElement;

      const setup = async () => {
        await waitFor();
        target = selector(name);
        [button1, button2] = selectorAll<HTMLButtonElement>("button", target);
        consumer1 = selector("theme-consumer", target);
        consumer2 = selector("theme2-consumer", target);
        inner1 = selector("div", consumer1);
        inner2 = selector("div", consumer2);
      };

      it("double contexts", async () => {
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
    })
  );

  fixture = () => {
    const [theme, setTheme] = useState<Theme2>("red");
    const toggle = useCallback(() => {
      setTheme(t => (t === "red" ? "green" : "red"));
    });
    const [theme2, setTheme2] = useState<Theme2>("red");
    const toggle2 = useCallback(() => {
      setTheme2(t => (t === "red" ? "green" : "red"));
    });

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
  };
  describe(
    "same contexts",
    withFixture(fixture, name => {
      let target: Element;
      let button1: HTMLButtonElement;
      let button2: HTMLButtonElement;
      let consumer1: Element;
      let consumer2: Element;
      let inner1: HTMLDivElement;
      let inner2: HTMLDivElement;

      const setup = async () => {
        await waitFor();
        target = selector(name);
        [button1, button2] = selectorAll<HTMLButtonElement>("button", target);
        [consumer1, consumer2] = selectorAll("theme2-consumer", target);
        inner1 = selector("div", consumer1);
        inner2 = selector("div", consumer2);
      };

      it("same contexts", async () => {
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
    })
  );

  fixture = () => {
    const [theme, setTheme] = useState<Theme>("dark");
    const toggle = useCallback(() => {
      setTheme(t => (t === "dark" ? "light" : "dark"));
    });
    const [theme2, setTheme2] = useState<Theme>("dark");
    const toggle2 = useCallback(() => {
      setTheme2(t => (t === "dark" ? "light" : "dark"));
    });

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
  };
  describe(
    "duplicate contexts",
    withFixture(fixture, name => {
      let target: Element;
      let button1: HTMLButtonElement;
      let button2: HTMLButtonElement;
      let consumer1: Element;
      let consumer2: Element;
      let inner1: HTMLDivElement;
      let inner2: HTMLDivElement;

      const setup = async () => {
        await waitFor();
        target = selector(name);
        [button1, button2] = selectorAll<HTMLButtonElement>("button", target);
        [consumer1, consumer2] = selectorAll("theme-consumer", target);
        inner1 = selector("div", consumer1);
        inner2 = selector("div", consumer2);
      };

      it("duplicate contexts", async () => {
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
    })
  );
});
