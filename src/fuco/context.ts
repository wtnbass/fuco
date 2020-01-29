import { Cleanup } from "./hook";

export interface Context<T> {
  readonly initialValue?: T;
  readonly defineProvider: (name: string) => void;
  readonly Provider: () => unknown;
}

export interface Detail<T> {
  context: Context<T>;
  register(
    subscribe: (s: ContextSubscriber<T>) => Cleanup,
    initialValue: T
  ): void;
}

export type ContextSubscriber<T> = (value: T) => void;

export const REQUEST_CONSUME =
  "context:request-consume:" + String(Math.random()).slice(2);
