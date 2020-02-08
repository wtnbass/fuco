import { HasCSSSymbol } from "./css";
import { Hooks, EffectFn, Cleanup } from "./hook";

export interface AttributeConverter<T> {
  (attr: string | null): T;
}

export interface Component {
  _hooks: Hooks<unknown>;
  update(): void;
  _performUpdate(): void;
  _flushEffects(effects: EffectFn[]): void;
  _attr<T>(name: string, converter?: AttributeConverter<T>): T | string | null;
  _observeAttr(name: string, callback: () => void): Cleanup;
  _dispatch<T>(name: string, init: CustomEventInit<T>): void;
  _adoptStyle(css: HasCSSSymbol): void;
}
