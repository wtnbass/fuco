import { Component } from "./component";
import { Context } from "./context";

export abstract class Provider<T> extends HTMLElement {
  protected abstract get contextId(): number;

  private _value: T | undefined;
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

        if (this.contextId === context.id) {
          e.stopPropagation();
          consumer.recieveContextUnsubscribe(context, this, () => {
            this.consumers.delete(consumer);
          });
          this.consumers.add(consumer);
        }
      }
    );
  }

  public get value() {
    return this._value;
  }

  public set value(newValue) {
    this._value = newValue;
    this.consumers.forEach(c => c.update());
  }
}
