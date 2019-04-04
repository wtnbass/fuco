import { html } from "lit-html";
import { useProperty, useEffect } from "./hooks";
import { FunctionalComponent } from ".";
import { Component } from "./component";

export const subscribeSymbol = Symbol("subscribe");

export interface Context<T = any> {
  readonly [subscribeSymbol]: (c: Component) => () => void;
  readonly value: T | undefined;
  readonly Provider: FunctionalComponent;
}

export function createContext<T>(defaultValue?: T): Context<T> {
  let components = new Set<Component>();
  let _value = defaultValue;

  function Provider() {
    const value = useProperty<T>("value");

    useEffect(() => {
      _value = value;
      components.forEach(c => c.update());
    }, [value]);

    return html`
      <slot></slot>
    `;
  }

  function subscribe(component: Component) {
    components.add(component);
    return function unsubscribe() {
      components.delete(component);
    };
  }

  return {
    Provider,
    [subscribeSymbol]: subscribe,
    get value() {
      return _value;
    }
  };
}
