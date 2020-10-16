import { expect } from "chai";
import {
  withFixtures,
  selector,
  text,
  createCaughtErrorPromise,
} from "./fixture";
import {
  html,
  defineElement,
  useAttribute,
  useErrorBoundary,
  useEffect,
  useLayoutEffect,
  useState,
} from "../fuco";

type ErrorKind = "render" | "effect" | "layout-effect" | "cleanup" | "unmount";
const fixture = () => {
  const kind = useAttribute<ErrorKind>("error-kind", (s) => s as ErrorKind);
  const [error, clearError] = useErrorBoundary();
  const [fallback, setFallback] = useState(false);
  if (error) {
    return html`
      <div>${error.message}</div>
      <button @click=${() => (setFallback(true), clearError())}>clear</button>
    `;
  }
  if (fallback) {
    return html` <div>fallback</div> `;
  }
  switch (kind) {
    case "render":
      return html` <render-error /> `;
    case "effect":
      return html` <effect-error /> `;
    case "layout-effect":
      return html` <layout-effect-error /> `;
    case "cleanup":
      return html` <cleanup-error /> `;
    case "unmount":
      return html` <unmount-error /> `;
    default:
      kind as never;
      return "";
  }
};

defineElement("render-error", () => {
  throw new Error("error on render");
});

defineElement("effect-error", () => {
  useEffect(() => {
    throw new Error("error on effect");
  });
  return "";
});

defineElement("layout-effect-error", () => {
  useLayoutEffect(() => {
    throw new Error("error on layout effect");
  });
  return "";
});

defineElement("cleanup-error", () => {
  const value = useAttribute("value");
  useEffect(() => {
    return () => {
      throw new Error("error on cleanup");
    };
  }, [value]);
  return value;
});

defineElement("unmount-error", () => {
  useEffect(() => {
    return () => {
      throw new Error("error on unmount");
    };
  }, []);
  return "";
});

describe(
  "use-error-boundary",
  withFixtures(fixture)(([f]) => {
    it("error on render", async () => {
      const caughtError = createCaughtErrorPromise();
      const el = await f.setup();
      el.setAttribute("error-kind", "render");
      await f.setup();
      await caughtError;

      const div = selector("div", el);
      expect(text(div)).to.equal("error on render");
    });

    it("error on effect", async () => {
      const caughtError = createCaughtErrorPromise();
      const el = await f.setup();
      el.setAttribute("error-kind", "effect");
      await f.setup();
      await caughtError;

      const div = selector("div", el);
      expect(text(div)).to.equal("error on effect");
    });

    it("error on layout effect", async () => {
      const caughtError = createCaughtErrorPromise();
      const el = await f.setup();
      el.setAttribute("error-kind", "layout-effect");
      await f.setup();
      await caughtError;

      const div = selector("div", el);
      expect(text(div)).to.equal("error on layout effect");
    });

    it("error on cleanup", async () => {
      const caughtError = createCaughtErrorPromise();
      const el = await f.setup();
      el.setAttribute("error-kind", "cleanup");
      await f.setup();
      const target = selector("cleanup-error", el);
      target.setAttribute("value", "error");
      await f.setup();
      await caughtError;

      const div = selector("div", el);
      expect(text(div)).to.equal("error on cleanup");
    });

    it.skip("error on unmount", async () => {
      // TODO: fail because cannot propagate the fuco error event on disconnected...
      const caughtError = createCaughtErrorPromise();
      const el = await f.setup();
      el.setAttribute("error-kind", "unmount");
      await f.setup();

      el.setAttribute("error-kind", "noerror");
      await f.setup();
      await caughtError;

      const div = selector("div", el);
      console.log(el.shadowRoot?.innerHTML);
      expect(text(div)).to.equal("error on unmount");
    });

    it("clear error", async () => {
      const caughtError = createCaughtErrorPromise();
      const el = await f.setup();
      el.setAttribute("error-kind", "render");
      await f.setup();
      await caughtError;

      const button = selector<HTMLButtonElement>("button", el);
      button.click();
      await f.setup();

      const div = selector("div", el);
      expect(text(div)).to.equal("fallback");
    });
  })
);
