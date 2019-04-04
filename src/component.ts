import {
  Hook,
  setCurrent,
  HasCleanupHook,
  EffectHook,
  ContextHook
} from "./hooks";
import { Context } from "./context";

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
    setCurrent(this, 0);
    this.render();
    this.runEffects();
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
}
