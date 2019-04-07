import { html } from "lit-html";
import { useProperty, useState, useEffect, useCallback } from "./hooks";
import { FunctionalComponent } from ".";
import { Component } from "./component";

export interface Context<T = any> {
  readonly id: number;
  readonly value: T | undefined;
  readonly Provider: FunctionalComponent;
}

let contextId = 0;

export function createContext<T>(defaultValue?: T): Context<T> {
  let _value = defaultValue;
  const id = contextId++;

  function Provider() {
    const value = useProperty<T>("value");
    const [components] = useState<Set<Component>>(new Set());

    useEffect(() => {
      _value = value;
      components.forEach(c => c.update());
    }, [value]);

    const request = useCallback((e: Event) => {
      const { detail } = e as CustomEvent<{
        context: Context;
        consumer: Component;
      }>;
      const { context, consumer } = detail;

      if (id === context.id) {
        consumer.recieveContextUnsubscribe(context, () => {
          components.delete(consumer);
        });
        components.add(consumer);
      }
    });

    return html`
      <slot @functional-web-component:request-consume=${request}></slot>
    `;
  }

  return {
    id,
    Provider,
    get value() {
      return _value;
    }
  };
}
