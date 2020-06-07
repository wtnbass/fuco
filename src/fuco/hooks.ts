import { Context, Detail, REQUEST_CONSUME } from "./context";
import { HasCSSSymbol } from "./css";
import { hooks, Deps, EffectFn, AttributeConverter, Listener } from "./hook";
import { renderComponent, enqueueUpdate } from "./reconciler";
import { errorType } from "./error";
import { Component } from "./component";

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
    _onmount(h, c, i) {
      h._cleanup[i] = c._observeAttr(name, () => {
        const newValue = c._attr(name, converter);
        if (!Object.is(h._values[i], newValue)) {
          h._values[i] = newValue;
          renderComponent(c as Component);
        }
      });
      return c._attr(name, converter);
    },
  });
}

export const useProperty = <T>(name: string) =>
  hooks<T>({
    _onmount(h, c, i) {
      const initialValue = (c as typeof c & { [name: string]: T })[name];

      Object.defineProperty(c, name, {
        get() {
          return h._values[i];
        },
        set(newValue) {
          if (!Object.is(h._values[i], newValue)) {
            h._values[i] = newValue;
            enqueueUpdate(c as Component);
          }
        },
      });
      return initialValue;
    },
  });

export const useDispatchEvent = <T>(name: string, eventInit: EventInit = {}) =>
  hooks<(detail: T) => void>({
    _onmount: (_, c) => (detail: T) =>
      c._dispatch(name, { ...eventInit, detail }),
  });

export const useListenEvent = <T extends Event>(
  name: string,
  listener: Listener<T>
) =>
  hooks<void>({
    _onmount(h, c, i) {
      h._cleanup[i] = c._listen(name, listener);
    },
  });

export const useStyle = (cssStyle: HasCSSSymbol | (() => HasCSSSymbol)) =>
  hooks<void>({
    _onmount(_, c) {
      c._adoptStyle(typeof cssStyle === "function" ? cssStyle() : cssStyle);
    },
  });

export const useRef = <T>(initialValue: T | null) =>
  hooks<{ current: T | null }>({
    _onmount: (_h, _c) => ({ current: initialValue }),
  });

export const useState = <T>(
  initialState: T | (() => T)
): [T, (t: T | ((s: T) => T)) => void] =>
  useReducer<T, T | ((s: T) => T)>(
    (state, nextState) =>
      typeof nextState === "function"
        ? (nextState as (s: T) => T)(state)
        : nextState,
    typeof initialState === "function"
      ? (initialState as () => T)()
      : initialState
  );

export const useReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
) =>
  hooks<[S, (action: A) => void]>({
    _onmount: (h, c, i) => [
      initialState,
      function dispatch(action: A) {
        const state = h._values[i][0];
        const nextState = reducer(state, action);
        if (!Object.is(state, nextState)) {
          h._values[i][0] = nextState;
          enqueueUpdate(c as Component);
        }
      },
    ],
  });

export const useContext = <T>(context: Context<T>) =>
  hooks<T | undefined>({
    _onmount: (h, c, i) => {
      h._values[i] = context._defaultValue;
      c._dispatch<Detail<T>>(REQUEST_CONSUME, {
        bubbles: true,
        composed: true,
        detail: {
          _context: context,
          _register(subscribe) {
            const update = (nextValue: T) => {
              if (!Object.is(h._values[i], nextValue)) {
                h._values[i] = nextValue;
                enqueueUpdate(c as Component);
              }
            };
            h._cleanup[i] = subscribe(update);
            return update;
          },
        },
      });
      return h._values[i];
    },
  });

const depsChanged = (prev: Deps | undefined, next: Deps) =>
  !prev || next.some((f, i) => !Object.is(f, prev[i]));

export const useEffect = (handler: EffectFn, deps?: Deps) =>
  hooks<void>({
    _onupdate(h, _, i) {
      if (!deps || depsChanged(h._deps[i], deps)) {
        h._deps[i] = deps || [];
        h._effects[i] = handler;
      }
    },
  });

export const useLayoutEffect = (handler: EffectFn, deps?: Deps) =>
  hooks<void>({
    _onupdate(h, _, i) {
      if (!deps || depsChanged(h._deps[i], deps)) {
        h._deps[i] = deps || [];
        h._layoutEffects[i] = handler;
      }
    },
  });

export const useMemo = <T>(fn: () => T, deps?: Deps) =>
  hooks<T>({
    _onupdate(h, _, i) {
      if (!deps || depsChanged(h._deps[i], deps)) {
        h._deps[i] = deps || [];
        h._values[i] = fn();
      }
    },
  });

// eslint-disable-next-line @typescript-eslint/ban-types
export const useCallback = <T extends Function>(callback: T, deps?: Deps) =>
  useMemo(() => callback, deps);

export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);
  useListenEvent(errorType, (e: CustomEvent<Error>) => {
    setError(e.detail);
  });
  return [error, () => setError(null)] as const;
};
