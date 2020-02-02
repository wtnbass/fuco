import { Component, AttributeConverter } from "./component";
import { HasCSSSymbol } from "./css";

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
let currentComponent: FucoComponent;

export interface FucoComponent {
  _hooks: Hooks<unknown>;
  _attr<T>(name: string, converter?: AttributeConverter<T>): T | string | null;
  _observeAttr(name: string, callback: () => void): void;
  _dispatch<T>(name: string, init: CustomEventInit<T>): void;
  _adoptStyle(css: HasCSSSymbol): void;
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

export function __setCurrent__(c: FucoComponent) {
  currentComponent = c;
  currentCursor = 0;
}

export function hooks<T>(config: {
  _onmount?: (h: Hooks<T>, c: Component, i: number) => T;
  _onupdate?: (h: Hooks<T>, c: Component, i: number) => void;
}): T {
  const h = currentComponent._hooks as Hooks<T>;
  const c = currentComponent as Component;
  const index = currentCursor++;
  if (h._values.length <= index && config._onmount) {
    h._values[index] = config._onmount(h, c, index);
  }
  if (config._onupdate) {
    config._onupdate(h, c, index);
  }
  return h._values[index];
}
