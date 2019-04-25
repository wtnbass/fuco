import { Hook, setCurrent, EffectHook } from "./hooks";
import { RAISE_ERROR, dispatchCustomEvent } from "./event";

export abstract class Component extends HTMLElement {
  public hooks: Hook[] = [];
  public effects: EffectHook[] = [];
  private updating = false;

  public abstract rootElement: Element | ShadowRoot;

  protected connectedCallback() {
    this.update();
  }

  protected disconnectedCallback() {
    this.hooks.forEach(h => h.cleanup && h.cleanup());
  }

  protected abstract callFunction(): void;

  public update() {
    this.updating || this.enqueue();
  }

  private async enqueue() {
    this.updating = true;
    await Promise.resolve();
    try {
      setCurrent(this, 0);
      this.callFunction();
      this.runEffects();
    } catch (error) {
      dispatchCustomEvent(this, RAISE_ERROR, { error });
    } finally {
      this.updating = false;
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
}
