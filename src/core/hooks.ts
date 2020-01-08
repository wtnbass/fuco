import { Component, Deps, EffectFn, hooks } from "./component";
import { HasCSSSymbol, stringifyCSS } from "./css";
import { Context, Detail, REQUEST_CONSUME } from "./context";

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
        if (!Object.is(h.values[i], newValue)) {
          h.values[i] = newValue;
          if (c._dirty) return;
          c._dirty = true;
          c._performUpdate();
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
          if (!Object.is(h.values[i], newValue)) {
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

export const useStyle = (cssStyle: HasCSSSymbol | (() => HasCSSSymbol)) =>
  hooks<void>({
    oncreate(h, c, i) {
      if (typeof cssStyle === "function") {
        cssStyle = cssStyle();
      }
      const css = stringifyCSS(cssStyle);
      if (enabledAdoptedStyleSheets) {
        const styleSheet = new CSSStyleSheet();
        styleSheet.replace(css);
        c.$root.adoptedStyleSheets = [
          ...c.$root.adoptedStyleSheets,
          styleSheet
        ];
      } else {
        h.layoutEffects[i] = () => {
          const style = document.createElement("style");
          style.textContent = css;
          c.$root.appendChild(style);
        };
      }
    }
  });

export const useRef = <T>(initialValue: T | null) =>
  hooks<{ current: T | null }>({
    oncreate: (_h, _c) => ({ current: initialValue })
  });

export const useState = <T>(initialState: T | (() => T)) =>
  hooks<[T, (t: T | ((s: T) => T)) => void]>({
    oncreate: (h, c, i) => [
      typeof initialState === "function"
        ? (initialState as () => T)()
        : initialState,
      function setState(nextState: T | ((s: T) => T)) {
        const state = h.values[i][0];
        if (typeof nextState === "function") {
          nextState = (nextState as (s: T) => T)(state);
        }
        if (!Object.is(state, nextState)) {
          h.values[i][0] = nextState;
          c.update();
        }
      }
    ]
  });

export const useReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
) =>
  hooks<[S, (action: A) => void]>({
    oncreate: (h, c, i) => [
      initialState,
      function dispatch(action: A) {
        const state = h.values[i][0];
        const nextState = reducer(state, action);
        if (!Object.is(state, nextState)) {
          h.values[i][0] = nextState;
          c.update();
        }
      }
    ]
  });

export const useContext = <T>(context: Context<T>) =>
  hooks<T | undefined>({
    oncreate: (h, c, i) => {
      h.values[i] = context.initialValue;
      c.dispatchEvent(
        new CustomEvent<Detail<T>>(REQUEST_CONSUME, {
          bubbles: true,
          composed: true,
          detail: {
            context,
            register(provider) {
              h.values[i] = provider.value;
              h.cleanup[i] = provider.subscribe(() => {
                if (!Object.is(h.values[i], provider.value)) {
                  h.values[i] = provider.value;
                  c.update();
                }
              });
            }
          }
        })
      );
      return h.values[i];
    }
  });

const depsChanged = (prev: Deps | undefined, next: Deps) =>
  prev == null || next.some((f, i) => !Object.is(f, prev[i]));

export const useEffect = (handler: EffectFn, deps?: Deps) =>
  hooks<void>({
    onupdate(h, _, i) {
      if (!deps || depsChanged(h.deps[i], deps)) {
        h.deps[i] = deps || [];
        h.effects[i] = handler;
      }
    }
  });

export const useLayoutEffect = (handler: EffectFn, deps?: Deps) =>
  hooks<void>({
    onupdate(h, _, i) {
      if (!deps || depsChanged(h.deps[i], deps)) {
        h.deps[i] = deps || [];
        h.layoutEffects[i] = handler;
      }
    }
  });

export const useMemo = <T>(fn: () => T, deps?: Deps) =>
  hooks<T>({
    onupdate(h, _, i) {
      let value = h.values[i];
      if (!deps || depsChanged(h.deps[i], deps)) {
        h.deps[i] = deps || [];
        value = fn();
      }
      return value;
    }
  });

export const useCallback = <T extends Function>(callback: T, deps?: Deps) =>
  useMemo(() => callback, deps);
