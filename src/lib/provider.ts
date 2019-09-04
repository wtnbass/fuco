import { Component } from "./component";
import { Context } from "./context";

export const REQUEST_CONSUME =
  "context:request-consume:" + String(Math.random()).slice(2);

export interface Detail<T> {
  context: Context<T>;
  consumer: Component;
  register(provider: Provider<T>): void;
}

export abstract class Provider<T> extends HTMLElement {
  protected abstract get contextId(): number;

  private _value: T | undefined;
  private consumers = new Set<Component>();

  public constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      document.createElement("slot")
    );
  }

  protected connectedCallback() {
    this.addEventListener(REQUEST_CONSUME, e => {
      const {
        detail: { context, consumer, register }
      } = e as CustomEvent<Detail<T>>;

      if (this.contextId === context.id) {
        e.stopPropagation();
        this.consumers.add(consumer);
        register(this);
      }
    });
  }

  public unsubscribe(consumer: Component) {
    this.consumers.delete(consumer);
  }

  public get value() {
    return this._value;
  }

  public set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.consumers.forEach(c => c.update());
    }
  }
}
