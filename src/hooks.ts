import { hooks, Component } from "./component";
import { Context } from "./context";
import { Provider } from "./provider";
import { cssSymbol, HasCSSSymbol } from "./css";
import { REQUEST_CONSUME, dispatchCustomEvent } from "./event";

export const useAttribute = (name: string) =>
  hooks<string>((h, c, i) => {
    const m = new MutationObserver(() => {
      const newValue = c.getAttribute(name) || "";
      if (h.values[i] !== newValue) {
        h.values[i] = newValue;
        c.update();
      }
    });
    m.observe(c, { attributes: true, attributeFilter: [name] });
    h.cleanup[i] = () => m.disconnect();
    return c.getAttribute(name) || "";
  });

export const useProperty = <T>(name: string) =>
  hooks<T>((h, c, i) => {
    const initialValue = (c as Component & { [name: string]: T })[name];

    Object.defineProperty(c, name, {
      get() {
        return h.values[i];
      },
      set(newValue) {
        if (h.values[i] !== newValue) {
          h.values[i] = newValue;
          c.update();
        }
      }
    });
    return initialValue;
  });

export const useSelector = <T extends Element>(selector: string) =>
  hooks<{
    readonly current: T | null;
    readonly all: NodeListOf<T> | null;
  }>((_, c) => ({
    get current() {
      return c.rootElement.querySelector<T>(selector);
    },
    get all() {
      return c.rootElement.querySelectorAll<T>(selector);
    }
  }));

export const useDispatchEvent = <T>(name: string, init: CustomEventInit = {}) =>
  hooks<(detail: T) => void>((_, c) => (detail: T) =>
    c.dispatchEvent(
      new CustomEvent(name, {
        ...init,
        detail
      })
    )
  );

const enabledAdoptedStyleSheets =
  "adoptedStyleSheets" in Document.prototype &&
  "replace" in CSSStyleSheet.prototype;

export const useStyle = (...styles: HasCSSSymbol[]) =>
  hooks((h, c, i) => {
    if (enabledAdoptedStyleSheets) {
      c.rootElement.adoptedStyleSheets = styles.map(css => {
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(css[cssSymbol]);
        return styleSheet;
      });
    } else {
      h.effects[i] = () => {
        for (let i = 0, l = styles.length; i < l; i++) {
          const style = document.createElement("style");
          style.textContent = styles[i][cssSymbol];
          c.rootElement.appendChild(style);
        }
      };
    }
    return 0;
  });

export const useState = <T>(initialState: T) =>
  hooks<[T, ((t: T | ((s: T) => T)) => void)]>((h, c, i) => [
    initialState,
    function setState(nextState: T | ((s: T) => T)) {
      const state = h.values[i][0];
      if (typeof nextState === "function") {
        nextState = (nextState as (s: T) => T)(state);
      }
      if (state !== nextState) {
        h.values[i][0] = nextState;
        c.update();
      }
    }
  ]);

export const useReducer = <S, A>(
  reducer: (state: S | undefined, action: A) => S,
  initialState: S
) =>
  hooks<[S, (action: A) => void]>((h, c, i) => [
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    reducer(initialState, { type: Symbol() } as any),
    function dispatch(action: A) {
      const state = h.values[i][0];
      const nextState = reducer(state, action);
      if (state !== nextState) {
        h.values[i][0] = nextState;
        c.update();
      }
    }
  ]);

export const useContext = <T>(context: Context<T>) =>
  hooks<T | undefined>((h, c, i) => {
    if (!h.deps[i] || h.deps[i].length <= 0) {
      dispatchCustomEvent(c, REQUEST_CONSUME, {
        context,
        consumer: c,
        register(provider: Provider<T>) {
          h.deps[i] = [provider];
        }
      });
    }
    return (h.deps[i][0] as Provider<T>).value;
  }, true);

const depsChanged = (prev: unknown[] | undefined, next: unknown[]) =>
  prev == null || next.some((f, i) => f !== prev[i]);

export const useEffect = (
  handler: () => void | (() => void),
  deps: unknown[] = []
) =>
  hooks((h, _, i) => {
    if (depsChanged(h.deps[i], deps)) {
      h.deps[i] = deps;
      h.effects[i] = handler;
    }
    return 0;
  }, true);

export const useMemo = <T>(fn: () => T, deps: unknown[] = []) =>
  hooks((h, _, i) => {
    let value = h.values[i];
    if (depsChanged(h.deps[i], deps)) {
      h.deps[i] = deps;
      value = fn();
    }
    return value;
  }, true);

export const useCallback = <A, R>(
  callback: (a: A) => R,
  deps: unknown[] = []
) => useMemo(() => callback, deps);
