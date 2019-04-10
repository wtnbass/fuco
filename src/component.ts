import { Hook, setCurrent, EffectHook, ContextHook } from "./hooks";
import { Context } from "./context";
import { Provider } from "./provider";

function createCustomEvent<T>(name: string, detail: T): CustomEvent<T> {
  return new CustomEvent(name, {
    bubbles: true,
    composed: true,
    detail
  });
}

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

  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop
  private async enqueue() {
    this.updating = true;
    await Promise.resolve();
    try {
      setCurrent(this, 0);
      this.callFunction();
      this.runEffects();
    } catch (e) {
      this.dispatchError(e);
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

  public dispatchRequestConsume(context: Context) {
    this.dispatchEvent(
      createCustomEvent("functional-web-component:request-consume", {
        context,
        consumer: this
      })
    );
  }

  public recieveContextUnsubscribe(
    context: Context,
    provider: Provider<any>,
    unsubscribe: () => void
  ) {
    const hook = this.contexts.get(context);
    if (hook) {
      hook.provider = provider;
      hook.cleanup = unsubscribe;
    }
  }

  private dispatchError(error: Error) {
    this.dispatchEvent(
      createCustomEvent("functional-web-component:error-boundary", {
        error
      })
    );
  }

  public subscribeErrorEvent(
    callback: (e: CustomEvent<{ error: Error }>) => void
  ) {
    // It is unnecessary to unsubscribe because the listener is related by `this`.
    this.addEventListener(
      "functional-web-component:error-boundary",
      (e: Event) => {
        callback(e as CustomEvent<{ error: Error }>);
      }
    );
  }
}
