import {
  Hook,
  setCurrent,
  HasCleanupHook,
  EffectHook,
  ContextHook
} from "./hooks";
import { Context } from "./context";

type ComponentErrorEvent = CustomEvent<{ error: Error }>;

export abstract class Component extends HTMLElement {
  public rootElement = this.attachShadow({ mode: "open" });
  public hooks: Hook[] = [];
  public effects: EffectHook[] = [];
  public contexts = new WeakMap<Context, ContextHook>();

  protected connectedCallback() {
    this.update();
  }

  protected disconnectedCallback() {
    this.cleanup();
  }
  protected abstract render(): void;

  public update() {
    try {
      setCurrent(this, 0);
      this.render();
      this.runEffects();
    } catch (e) {
      this.dispatchEvent(this.errorEvent(e));
    }
  }

  private runEffects() {
    this.effects.forEach(hook => {
      if (hook.cleanup) hook.cleanup();
      if (hook.handler) {
        const cleanup = hook.handler();
        if (typeof cleanup === "function") {
          hook.cleanup = cleanup;
        }
      }
    });
    this.effects = [];
  }

  private cleanup() {
    this.hooks.forEach(hook => {
      const h = hook as HasCleanupHook;
      if (h.cleanup) h.cleanup();
    });
  }

  private errorEvent(error: Error): ComponentErrorEvent {
    return new CustomEvent("functional-web-component:error-boundary", {
      bubbles: true,
      composed: true,
      detail: { error }
    });
  }

  public subscribeErrorEvent(callback: (e: ComponentErrorEvent) => void) {
    this.addEventListener(
      "functional-web-component:error-boundary",
      (e: Event) => {
        callback(e as ComponentErrorEvent);
      }
    );
  }
}
