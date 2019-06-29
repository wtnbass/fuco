import { hooks, Component } from "./component";
import { Context } from "./context";
import { cssSymbol, HasCSSSymbol } from "./css";
import { REQUEST_CONSUME, Detail, Provider } from "./provider";

export interface AttributeConverter<T> {
  (attr: string | null): T;
}

export function useAttribute(name: string): string | null;

export function useAttribute<T>(
  name: string,
  converter: AttributeConverter<T>
): T;

export function useAttribute<T>(
  name: string,
  converter?: AttributeConverter<T>
) {
  return hooks<string | T | null>({
    oncreate(h, c, i) {
      const m = new MutationObserver(() => {
        const newValue = converter
          ? converter(c.getAttribute(name))
          : c.getAttribute(name);
        if (h.values[i] !== newValue) {
          h.values[i] = newValue;
          c.update();
        }
      });
      m.observe(c, { attributes: true, attributeFilter: [name] });
      h.cleanup[i] = () => m.disconnect();
      return converter ? converter(c.getAttribute(name)) : c.getAttribute(name);
    }
  });
}

export const useProperty = <T>(name: string) =>
  hooks<T>({
    oncreate(h, c, i) {
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
    }
  });

export const useDispatchEvent = <T>(name: string, eventInit: EventInit = {}) =>
  hooks<(detail: T) => void>({
    oncreate: (_, c) => (detail: T) =>
      c.dispatchEvent(
        new CustomEvent(name, {
          ...eventInit,
          detail
        })
      )
  });

const enabledAdoptedStyleSheets =
  "adoptedStyleSheets" in Document.prototype &&
  "replace" in CSSStyleSheet.prototype;

export const useStyle = (...styles: HasCSSSymbol[]) =>
  hooks<undefined>({
    oncreate(h, c, i) {
      if (enabledAdoptedStyleSheets) {
        for (let i = 0, l = styles.length; i < l; i++) {
          const styleSheet = new CSSStyleSheet();
          styleSheet.replace(styles[i][cssSymbol]);
          c.$root.adoptedStyleSheets = [
            ...c.$root.adoptedStyleSheets,
            styleSheet
          ];
        }
      } else {
        h.effects[i] = () => {
          for (let i = 0, l = styles.length; i < l; i++) {
            const style = document.createElement("style");
            style.textContent = styles[i][cssSymbol];
            c.$root.appendChild(style);
          }
        };
      }
      return undefined;
    }
  });

const refPrefix = `ref:${String(Math.random()).slice(2)}:`;

export const useRef = <T>(initialValue: T | null) =>
  hooks<{ current: T | null }>({
    oncreate: (_h, _c, i) =>
      Object.defineProperties(Object.create(null), {
        current: {
          value: initialValue,
          writable: true
        },
        toString: {
          value: () => refPrefix + i
        }
      }),
    onupdate: (h, c, i) => {
      h.effects[i] = () => {
        const value = c.$root.querySelector(`[ref="${refPrefix + i}"]`);
        if (value != null) {
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          h.values[i].current = value as any;
        }
      };
      return h.values[i];
    }
  });

export const useState = <T>(initialState: T) =>
  hooks<[T, ((t: T | ((s: T) => T)) => void)]>({
    oncreate: (h, c, i) => [
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
    ]
  });

export const useReducer = <S, A>(
  reducer: (state: S | undefined, action: A) => S,
  initialState: S
) =>
  hooks<[S, (action: A) => void]>({
    oncreate: (h, c, i) => [
      initialState,
      function dispatch(action: A) {
        const state = h.values[i][0];
        const nextState = reducer(state, action);
        if (state !== nextState) {
          h.values[i][0] = nextState;
          c.update();
        }
      }
    ]
  });

export const useContext = <T>(context: Context<T>) =>
  hooks<T | undefined>({
    oncreate: (h, c, i) => {
      c.dispatchEvent(
        new CustomEvent<Detail<T>>(REQUEST_CONSUME, {
          bubbles: true,
          composed: true,
          detail: {
            context,
            consumer: c,
            register(provider: Provider<T>) {
              h.deps[i] = [provider];
            }
          }
        })
      );
      return context.initialValue;
    },
    onupdate: (h, _, i) => (h.deps[i][0] as Provider<T>).value
  });

const depsChanged = (prev: unknown[] | undefined, next: unknown[]) =>
  prev == null || next.some((f, i) => f !== prev[i]);

export const useEffect = (
  handler: () => void | (() => void),
  deps: unknown[]
) =>
  hooks<undefined>({
    onupdate(h, _, i) {
      if (depsChanged(h.deps[i], deps)) {
        h.deps[i] = deps;
        h.effects[i] = handler;
      }
      return undefined;
    }
  });

export const useMemo = <T>(fn: () => T, deps: unknown[]) =>
  hooks<T>({
    onupdate(h, _, i) {
      let value = h.values[i];
      if (depsChanged(h.deps[i], deps)) {
        h.deps[i] = deps;
        value = fn();
      }
      return value;
    }
  });

export const useCallback = <A, R>(callback: (a: A) => R, deps: unknown[]) =>
  useMemo(() => callback, deps);
