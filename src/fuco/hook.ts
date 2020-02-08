import { Component } from "./component";

export interface Hooks<T> {
  _values: T[];
  _deps: Deps[];
  _effects: EffectFn[];
  _layoutEffects: EffectFn[];
  _cleanup: Cleanup[];
}

export type Deps = unknown[];

export type EffectFn = () => void | Cleanup;

export type Cleanup = () => void;

let currentCursor: number;
let currentComponent: Component;

export function __scope__(c: Component) {
  currentComponent = c;
  currentCursor = 0;
}

export function defaultHooks(): Hooks<unknown> {
  return {
    _values: [],
    _deps: [],
    _effects: [],
    _layoutEffects: [],
    _cleanup: []
  };
}

export function hooks<T>(config: {
  _onmount?: (h: Hooks<T>, c: Component, i: number) => T;
  _onupdate?: (h: Hooks<T>, c: Component, i: number) => void;
}): T {
  const h = currentComponent._hooks as Hooks<T>;
  const index = currentCursor++;
  if (h._values.length <= index && config._onmount) {
    h._values[index] = config._onmount(h, currentComponent, index);
  }
  if (config._onupdate) {
    config._onupdate(h, currentComponent, index);
  }
  return h._values[index];
}
