import { Component } from "./component";
import { Context } from "./context";

type Option<T> = T | undefined;

type Callback<Arg = void, Return = void> = (arg: Arg) => Return;

export type Hook =
  | PropertyHook<any>
  | StateHook<any>
  | ReducerHook<any, any>
  | ContextHook
  | EffectHook
  | MemoHook<any>;

interface PropertyHook<T> {
  value?: T;
}

interface StateHook<T> {
  value?: T;
  setter?: (value: T | Callback<T, T>) => void;
}

interface ReducerHook<S, A> {
  state?: S;
  dispatch?: (action: A) => void;
}

interface ContextHook {
  called?: boolean;
}

export interface EffectHook {
  handler?: () => Option<Callback>;
  fields?: any[];
  cleanup?: Callback;
}

interface MemoHook<T> {
  value?: T;
  fields?: any[];
}

interface InitElement {
  __init: {
    properties: string[];
  };
}

let currentCursor: number;
let currentElement: Component | InitElement;

export function createInitElement(): InitElement {
  return {
    __init: {
      properties: []
    }
  };
}

function isInit(el: Component | InitElement): el is InitElement {
  return "__init" in el;
}

export function setCurrent(el: Component | InitElement, cursor: number) {
  currentElement = el;
  currentCursor = cursor;
}

export function getProperties() {
  if (!isInit(currentElement)) return [];
  return currentElement.__init.properties;
}

const defaultInitialize = (_: InitElement) => undefined;

function createHook<T>(
  callback: (hook: Hook, el: Component) => T,
  initialize: (el: InitElement) => Option<T> = defaultInitialize
) {
  if (isInit(currentElement)) {
    return initialize(currentElement);
  }
  while (currentElement.hooks.length < currentCursor) {
    currentElement.hooks.push({});
  }
  return callback(currentElement.hooks[currentCursor++], currentElement);
}

const fieldsChanged = (prev: any[] | undefined, next: any[]) =>
  prev == null || next.some((f, i) => f !== prev[i]);

export const useAttribute = (name: string) =>
  createHook(
    (_, el) => {
      return el.getAttribute(name);
    },
    el => {
      el.__init.properties.push(name);
      return "";
    }
  );

export const useProperty = <T>(name: string) =>
  createHook((arg, el) => {
    const hook = arg as PropertyHook<T>;
    if (hook.value == null) {
      hook.value = (el as any)[name];
      Object.defineProperty(el, name, {
        get() {
          return hook.value;
        },
        set(newValue) {
          hook.value = newValue;
          el.update();
        }
      });
    }
    return hook.value;
  });

export const useState = <T>(initValue: T) =>
  createHook(
    (arg, el) => {
      const hook = arg as StateHook<T>;
      if (!hook.setter) {
        hook.value = initValue;
        hook.setter = function(newValue) {
          if (typeof newValue === "function") {
            newValue = (newValue as Callback<Option<T>, T>)(hook.value);
          }
          hook.value = newValue;
          el.update();
        };
      }
      return [hook.value, hook.setter];
    },
    () => [initValue]
  );

const initAction = { type: "__@@init__" };

export const useReducer = <S, A>(
  reducer: (state: Option<S>, action: A | typeof initAction) => S,
  initialState: S
) =>
  createHook(
    (arg, el) => {
      const hook = arg as ReducerHook<S, A>;
      if (hook.state == null) {
        hook.state = reducer(initialState, initAction);
        hook.dispatch = (action: A) => {
          hook.state = reducer(hook.state, action);
          el.update();
        };
      }
      return [hook.state, hook.dispatch];
    },
    () => [reducer(initialState, initAction)]
  );

export const useContext = <T>(context: Context<T>) =>
  createHook((arg, el) => {
    const hook = arg as ContextHook;
    if (!hook.called) {
      hook.called = true;
      context.components.push(el);
    }
    return context.value;
  });
export const useEffect = (
  handler: () => Option<Callback>,
  fields: any[] = []
) =>
  createHook((arg, el) => {
    const hook = arg as EffectHook;
    if (fieldsChanged(hook.fields, fields)) {
      hook.fields = fields;
      hook.handler = handler;
      el.effects.push(hook);
    }
  });

export const useMemo = <T>(fn: Callback<void, T>, fields: any[] = []) =>
  createHook(arg => {
    const hook = arg as MemoHook<T>;
    if (fieldsChanged(hook.fields, fields)) {
      hook.fields = fields;
      hook.value = fn();
    }
    return hook.value;
  });

export const useCallback = (callback: Callback, fields: any[] = []) =>
  useMemo(() => callback, fields);
