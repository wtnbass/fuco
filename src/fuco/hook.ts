import { Component, AttributeConverter } from "./component";
import { HasCSSSymbol } from "./css";

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
let currentComponent: HookableComponent;

export interface HookableComponent {
  hooks: Hooks<unknown>;
  _attr<T>(name: string, converter?: AttributeConverter<T>): T | string | null;
  _observeAttr(name: string, callback: () => void): void;
  _dispatch<T>(name: string, init: CustomEventInit<T>): void;
  _adoptStyle(css: HasCSSSymbol): void;
}

export function defaultHooks(): Hooks<unknown> {
  return {
    values: [],
    deps: [],
    effects: [],
    layoutEffects: [],
    cleanup: []
  };
}

export function __setCurrent__(c: HookableComponent) {
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
