import { hooks } from "./component";
import { Context } from "./context";
import { Provider } from "./provider";
import { REQUEST_CONSUME, dispatchCustomEvent } from "./event";

const fieldsChanged = (prev: any[] | undefined, next: any[]) =>
  prev == null || next.some((f, i) => f !== prev[i]);

export const useProperty = <T>(propName: string) =>
  hooks<T>((h, c, i) => {
    const attrName = propName.replace(/[A-Z]/g, c => "-" + c.toLowerCase());
    const initialValue = c.getAttribute(attrName) || (c as any)[propName];

    const m = new MutationObserver(() => {
      (c as any)[propName] = c.getAttribute(attrName) || (c as any)[propName];
    });
    m.observe(c, { attributes: true, attributeFilter: [attrName] });
    h.cleanup[i] = () => m.disconnect();

    Object.defineProperty(c, propName, {
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
    readonly current: Element | null;
    readonly all: NodeListOf<Element> | null;
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

export const useContext = <T>(context: Context) =>
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

export const useEffect = (
  handler: () => void | (() => void),
  deps: any[] = []
) =>
  hooks((h, _, i) => {
    if (fieldsChanged(h.deps[i], deps)) {
      h.deps[i] = deps;
      h.effects[i] = handler;
    }
    return 0;
  }, true);

export const useMemo = <T>(fn: () => T, deps: any[] = []) =>
  hooks((h, _, i) => {
    let value = h.values[i];
    if (fieldsChanged(h.deps[i], deps)) {
      h.deps[i] = deps;
      value = fn();
    }
    return value;
  }, true);

export const useCallback = <A, R>(callback: (a: A) => R, deps: any[] = []) =>
  useMemo(() => callback, deps);
