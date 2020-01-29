import { AttributeConverter, Component } from "./component";
import { Context, Detail, REQUEST_CONSUME } from "./context";
import { HasCSSSymbol } from "./css";
import { Deps, EffectFn, hooks } from "./hook";

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
      h._cleanup[i] = c._observeAttr(name, () => {
        const newValue = c._attr(name, converter);
        if (!Object.is(h._values[i], newValue)) {
          h._values[i] = newValue;
          c._performUpdate();
        }
      });
      return c._attr(name, converter);
    }
  });
}

export const useProperty = <T>(name: string) =>
  hooks<T>({
    oncreate(h, c, i) {
      const initialValue = (c as Component & { [name: string]: T })[name];

      Object.defineProperty(c, name, {
        get() {
          return h._values[i];
        },
        set(newValue) {
          if (!Object.is(h._values[i], newValue)) {
            h._values[i] = newValue;
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
      c._dispatch(name, { ...eventInit, detail })
  });

export const useStyle = (cssStyle: HasCSSSymbol | (() => HasCSSSymbol)) =>
  hooks<void>({
    oncreate(h, c, i) {
      h._layoutEffects[i] = () =>
        c._adoptStyle(typeof cssStyle === "function" ? cssStyle() : cssStyle);
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
        const state = h._values[i][0];
        if (typeof nextState === "function") {
          nextState = (nextState as (s: T) => T)(state);
        }
        if (!Object.is(state, nextState)) {
          h._values[i][0] = nextState;
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
        const state = h._values[i][0];
        const nextState = reducer(state, action);
        if (!Object.is(state, nextState)) {
          h._values[i][0] = nextState;
          c.update();
        }
      }
    ]
  });

export const useContext = <T>(context: Context<T>) =>
  hooks<T | undefined>({
    oncreate: (h, c, i) => {
      h._values[i] = context.initialValue;
      c._dispatch<Detail<T>>(REQUEST_CONSUME, {
        bubbles: true,
        composed: true,
        detail: {
          context,
          register(subscribe, initialValue) {
            h._values[i] = initialValue;
            h._cleanup[i] = subscribe(nextValue => {
              if (!Object.is(h._values[i], nextValue)) {
                h._values[i] = nextValue;
                c.update();
              }
            });
          }
        }
      });
      return h._values[i];
    }
  });

const depsChanged = (prev: Deps | undefined, next: Deps) =>
  prev == null || next.some((f, i) => !Object.is(f, prev[i]));

export const useEffect = (handler: EffectFn, deps?: Deps) =>
  hooks<void>({
    onupdate(h, _, i) {
      if (!deps || depsChanged(h._deps[i], deps)) {
        h._deps[i] = deps || [];
        h._effects[i] = handler;
      }
    }
  });

export const useLayoutEffect = (handler: EffectFn, deps?: Deps) =>
  hooks<void>({
    onupdate(h, _, i) {
      if (!deps || depsChanged(h._deps[i], deps)) {
        h._deps[i] = deps || [];
        h._layoutEffects[i] = handler;
      }
    }
  });

export const useMemo = <T>(fn: () => T, deps?: Deps) =>
  hooks<T>({
    onupdate(h, _, i) {
      let value = h._values[i];
      if (!deps || depsChanged(h._deps[i], deps)) {
        h._deps[i] = deps || [];
        value = fn();
      }
      return value;
    }
  });

export const useCallback = <T extends Function>(callback: T, deps?: Deps) =>
  useMemo(() => callback, deps);
