import { Cleanup } from "./hook";

export interface Context<T> {
  readonly _defaultValue?: T;
  readonly defineProvider: (name: string) => void;
  readonly Provider: () => unknown;
}

export interface Detail<T> {
  _context: Context<T>;
  _register(
    subscribe: (s: ContextSubscriber<T>) => Cleanup,
    initialValue: T
  ): void;
}

export type ContextSubscriber<T> = (value: T) => void;

export const REQUEST_CONSUME = "fuco:context:" + String(Math.random()).slice(2);
