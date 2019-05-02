import { Component } from "./component";
import { Context } from "./context";
import { Provider } from "./provider";

export const REQUEST_CONSUME = "functional-web-component:request-consume";

interface Details {
  [REQUEST_CONSUME]: {
    context: Context<unknown>;
    consumer: Component;
    register(provider: Provider<unknown>): void;
  };
}

export function dispatchCustomEvent<
  N extends keyof Details,
  D extends Details[N]
>(element: Element, name: N, detail: D) {
  element.dispatchEvent(
    new CustomEvent(name, { bubbles: true, composed: true, detail })
  );
}

export function listenCustomEvent<
  N extends keyof Details,
  E extends CustomEvent<Details[N]>
>(element: Element, name: N, callback: (e: E) => void) {
  const listener = (e: Event) => {
    callback(e as E);
  };
  element.addEventListener(name, listener);
  return () => element.removeEventListener(name, listener);
}
