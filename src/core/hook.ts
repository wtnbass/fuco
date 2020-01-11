import { Component, FucoComponent } from "./component";

export interface Hooks<T> {
  values: T[];
  deps: Deps[];
  effects: EffectFn[];
  layoutEffects: EffectFn[];
  cleanup: Cleanup[];
}

export type Deps = unknown[];

export type EffectFn = () => void | Cleanup;

export type Cleanup = () => void;

let currentCursor: number;
let currentComponent: FucoComponent;

export function defaultHooks<T>(): Hooks<T> {
  return {
    values: [],
    deps: [],
    effects: [],
    layoutEffects: [],
    cleanup: []
  };
}

export function setCurrent(c: FucoComponent) {
  currentComponent = c;
  currentCursor = 0;
}

export function hooks<T>(config: {
  oncreate?: (h: Hooks<T>, c: Component, i: number) => T;
  onupdate?: (h: Hooks<T>, c: Component, i: number) => T;
}): T {
  const h = currentComponent.hooks as Hooks<T>;
  const c = currentComponent as Component;
  const index = currentCursor++;
  if (h.values.length <= index && config.oncreate) {
    h.values[index] = config.oncreate(h, c, index);
  }
  if (config.onupdate) {
    h.values[index] = config.onupdate(h, c, index);
  }
  return h.values[index];
}
