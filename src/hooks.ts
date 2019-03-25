import { Component } from "./component";

type Option<T> = T | undefined;

type Fn = () => void;

export type Hook = UseStateHook | UseEffectHook;

type UseStateHook<T = any> = {
  value?: T;
  setter?: (value: T) => void;
};

export type UseEffectHook = {
  handler?: () => Option<Fn>;
  fields?: any[];
  cleanup?: Fn;
};

export type InitElement = {
  __init: {
    properties: string[];
  };
};

let currentCursor: number;
let currentElement: Component | InitElement;

export function setCurrent(el: Component | InitElement, cursor: number) {
  currentElement = el;
  currentCursor = cursor;
}

export function getProperties() {
  if (!whenInit(currentElement)) return [];
  return currentElement.__init.properties;
}

function whenInit(el: Component | InitElement): el is InitElement {
  return !!(el as InitElement).__init;
}

export const useProperty = (name: string) =>
  createHook(
    (_, el: any) => {
      if (el[name]) return el[name];
      const attr = el.attributes[name];
      return attr ? attr.value : null;
    },
    el => {
      el.__init.properties.push(name);
      return "";
    }
  );

export const useState = (initValue: any) =>
  createHook(
    (_hook, el) => {
      const hook = _hook as UseStateHook;
      if (!hook.setter) {
        hook.value = initValue;
        hook.setter = function(newValue) {
          if (typeof newValue === "function") {
            newValue = newValue(hook.value);
          }
          hook.value = newValue;
          el.update();
        };
      }
      return [hook.value, hook.setter];
    },
    () => []
  );

const fieldsChanged = (prev: any[] | undefined, next: any[]) =>
  prev == null || next.some((f, i) => f === prev[i]);

export const useEffect = (handler: () => Option<Fn>, fields: any[] = []) =>
  createHook(
    (_hook, el) => {
      const hook = _hook as UseEffectHook;
      if (fieldsChanged(hook.fields, fields)) {
        hook.fields = fields;
        hook.handler = handler;
        el.effects.push(hook);
      }
    },
    () => null
  );

function createHook<T>(
  callback: (hook: Hook, el: Component) => T,
  initialize: (el: InitElement) => T
) {
  if (whenInit(currentElement)) {
    return initialize(currentElement);
  }
  return callback(getHook(currentCursor++), currentElement);
}

function getHook(index: number) {
  const el = currentElement as Component;
  while (el.hooks.length <= index) {
    el.hooks.push({});
  }
  return el.hooks[index];
}
