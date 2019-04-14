import { Hook, setCurrent, EffectHook, ContextHook } from "./hooks";
import { Context } from "./context";
import { Provider } from "./provider";
import { RAISE_ERROR, dispatchCustomEvent } from "./event";

export abstract class Component extends HTMLElement {
  public rootElement = this.attachShadow({ mode: "open" });
  public hooks: Hook[] = [];
  public effects: EffectHook[] = [];
  public contexts = new WeakMap<Context, ContextHook<any>>();
  private updating = false;

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

  // See https://developer.mozilla.org/docs/Web/JavaScript/EventLoop
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

  public recieveProvider(context: Context, provider: Provider<any>) {
    const hook = this.contexts.get(context);
    if (hook) {
      hook.provider = provider;
      hook.cleanup = () => provider.unsubscribe(this);
    }
  }
}
