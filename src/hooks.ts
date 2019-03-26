import { Component } from "./component";
import { Context } from "./context";

type Option<T> = T | undefined;

type Callback<Arg = void, Return = void> = (arg: Arg) => Return;

export type Hook<T = any> =
  | StateHook<T>
  | ContextHook
  | EffectHook
  | MemoHook<T>;

interface StateHook<T> {
  value?: T;
  setter?: (value: T | Callback<T, T>) => void;
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

function getHook(index: number) {
  const el = currentElement as Component;
  while (el.hooks.length <= index) {
    el.hooks.push({});
  }
  return el.hooks[index];
}

function createHook<T>(
  callback: (hook: Hook, el: Component) => T,
  initialize: (el: InitElement) => T
) {
  if (isInit(currentElement)) {
    return initialize(currentElement);
  }
  return callback(getHook(currentCursor++), currentElement);
}

const fieldsChanged = (prev: any[] | undefined, next: any[]) =>
  prev == null || next.some((f, i) => f !== prev[i]);

export const useProperty = (name: string) =>
  createHook(
    (_, el) => {
      return el.getAttribute(name);
    },
    el => {
      el.__init.properties.push(name);
      return "";
    }
  );

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
    () => []
  );

export const useContext = <T>(context: Context<T>) =>
  createHook(
    (arg, el) => {
      const hook = arg as ContextHook;
      if (!hook.called) {
        hook.called = true;
        context.components.push(el);
      }
      return context.value;
    },
    () => {}
  );
export const useEffect = (
  handler: () => Option<Callback>,
  fields: any[] = []
) =>
  createHook(
    (arg, el) => {
      const hook = arg as EffectHook;
      if (fieldsChanged(hook.fields, fields)) {
        hook.fields = fields;
        hook.handler = handler;
        el.effects.push(hook);
      }
    },
    () => null
  );

export const useMemo = <T>(fn: Callback<void, T>, fields: any[] = []) =>
  createHook(
    arg => {
      const hook = arg as MemoHook<T>;
      if (fieldsChanged(hook.fields, fields)) {
        hook.fields = fields;
        hook.value = fn();
      }
      return hook.value;
    },
    () => null
  );

export const useCallback = (callback: Callback, fields: any[] = []) =>
  useMemo(() => callback, fields);
