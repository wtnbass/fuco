import { Component } from "./component";

let contextId = 0;

export interface Context<T> {
  _id: number;
  _value: T | undefined;
  Provider: ProviderClass;
}

interface ProviderClass {
  prototype: {
    _id: number;
  };
}

export function createContext<T>(defaultValue?: T): Context<T> {
  const components: Component[] = [];
  const _id = contextId++;
  let _value = defaultValue;

  const Provider = class extends HTMLElement {
    public _id = _id;

    public constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        document.createElement("slot")
      );

      this.addEventListener("context-consumer-loaded", event => {
        const e = event as ConsumerLoadedEvent<T>;
        const { type, component } = e.detail;
        if (type._id === this._id) {
          components.push(component);
        }
      });

      Object.defineProperty(this, "value", {
        get() {
          return _value;
        },
        set(newValue) {
          _value = newValue;
          components.forEach(c => c.update());
        }
      });
    }
  };
  return { Provider, _id, _value };
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
    detail: {
      type,
      component
    },
    composed: true,
    bubbles: true
  });
}
