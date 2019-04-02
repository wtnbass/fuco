import { html } from "lit-html";
import { useProperty, useCallback, useEffect } from "./hooks";
import { FunctionalComponent } from ".";
import { Component } from "./component";

let contextId = 0;

export interface Context<T> {
  readonly id: number;
  readonly value: T | undefined;
  readonly Provider: FunctionalComponent;
}

export function createContext<T>(defaultValue?: T): Context<T> {
  const id = contextId++;

  let components: Component[] = [];
  let _value = defaultValue;

  function Provider() {
    const value = useProperty<T>("value");

    useEffect(() => {
      _value = value;
      components.forEach(c => c.update());
    }, [value]);

    const loadConsumer = useCallback((event: Event) => {
      const e = event as ConsumerLoadedEvent<T>;
      const { type, component } = e.detail;
      if (type.id === id) {
        components.push(component);
      }
    });

    const unloadConsumer = useCallback((event: Event) => {
      const e = event as ConsumerLoadedEvent<T>;
      const { type, component } = e.detail;
      if (type.id === id) {
        components = components.filter(c => c !== component);
      }
    });

    return html`
      <slot
        @context-consumer-loaded=${loadConsumer}
        @context-consumer-unloaded=${unloadConsumer}
      ></slot>
    `;
  }

  return {
    Provider,
    id,
    get value() {
      return _value;
    }
  };
}

type ConsumerLoadedEvent<T> = CustomEvent<{
  type: Context<T>;
  component: Component;
}>;

export function createConsumerEvent<T>(
  name: "context-consumer-loaded" | "context-consumer-unloaded",
  type: Context<T>,
  component: Component
) {
  return new CustomEvent(name, {
    bubbles: true,
    composed: true,
    detail: {
      type,
      component
    }
  });
}
