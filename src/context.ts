import { html } from "lit-html";
import { useProperty, useCallback, useEffect } from "./hooks";
import { Component, FunctionalComponent } from "./component";

let contextId = 0;

export interface Context<T> {
  readonly id: number;
  readonly value: T | undefined;
  readonly Provider: FunctionalComponent;
}

export function createContext<T>(defaultValue?: T): Context<T> {
  const components: Component[] = [];
  const id = contextId++;

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

    return html`
      <slot @context-consumer-loaded=${loadConsumer}></slot>
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

export function createConsumerLoadedEvent<T>(
  type: Context<T>,
  component: Component
) {
  return new CustomEvent("context-consumer-loaded", {
    bubbles: true,
    composed: true,
    detail: {
      type,
      component
    }
  });
}
