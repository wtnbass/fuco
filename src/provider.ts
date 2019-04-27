import { Component } from "./component";
import { REQUEST_CONSUME, listenCustomEvent } from "./event";

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
    listenCustomEvent(this, REQUEST_CONSUME, e => {
      const { context, consumer, register } = e.detail;
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
