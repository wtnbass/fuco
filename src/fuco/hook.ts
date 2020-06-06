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

export interface AttributeConverter<T> {
  (attr: string | null): T;
}

export interface Listener<T extends Event> {
  (evt: T): void;
}

export interface WithHooks {
  _hooks: Hooks<unknown>;
  _attr<T>(name: string, converter?: AttributeConverter<T>): T | string | null;
  _observeAttr(name: string, callback: () => void): Cleanup;
  _dispatch<T>(name: string, init: CustomEventInit<T>): void;
  _listen<T extends Event>(name: string, listener: Listener<T>): Cleanup;
  _adoptStyle(css: HasCSSSymbol): void;
}

let currentCursor: number;
let currentComponent: WithHooks;

export function __scope__(c: WithHooks) {
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
  _onmount?: (h: Hooks<T>, c: WithHooks, i: number) => T;
  _onupdate?: (h: Hooks<T>, c: WithHooks, i: number) => void;
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
