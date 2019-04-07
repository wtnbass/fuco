import { Component } from "./component";

export interface Context<T = any> {
  readonly id: number;
  readonly value: T | undefined;
  readonly defineProvider: (name: string) => void;
}

let contextId = 0;

export function createContext<T>(defaultValue?: T): Context<T> {
  let _value = defaultValue;
  const id = contextId++;

  class Provider extends HTMLElement {
    private consumers: Set<Component>;

    public constructor() {
      super();
      this.consumers = new Set<Component>();

      this.attachShadow({ mode: "open" }).appendChild(
        document.createElement("slot")
      );
      this.addEventListener(
        "functional-web-component:request-consume",
        (e: Event) => {
          const { detail } = e as CustomEvent<{
            context: Context;
            consumer: Component;
          }>;
          const { context, consumer } = detail;

          if (id === context.id) {
            consumer.recieveContextUnsubscribe(context, () => {
              this.consumers.delete(consumer);
            });
            this.consumers.add(consumer);
          }
        }
      );
    }

    public get value() {
      return _value;
    }

    public set value(newValue) {
      _value = newValue;
      this.consumers.forEach(c => c.update());
    }
  }

  return {
    id,
    defineProvider(name: string) {
      window.customElements.define(name, Provider);
    },
    get value() {
      return _value;
    }
  };
}
