import { Hook, setCurrent, EffectHook, ContextHook } from "./hooks";
import { Context } from "./context";
import { Provider } from "./provider";

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
    this.cleanup();
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

  private cleanup() {
    this.hooks.forEach(h => {
      if (h.cleanup) h.cleanup();
    });
  }

  private createCustomEvent<T>(name: string, detail: T): CustomEvent<T> {
    return new CustomEvent(name, {
      bubbles: true,
      composed: true,
      detail
    });
  }

  public dispatchRequestComsume(context: Context) {
    this.dispatchEvent(
      this.createCustomEvent("functional-web-component:request-consume", {
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
      this.createCustomEvent("functional-web-component:error-boundary", {
        error
      })
    );
  }

  public subscribeErrorEvent(
    callback: (e: CustomEvent<{ error: Error }>) => void
  ) {
    this.addEventListener(
      "functional-web-component:error-boundary",
      (e: Event) => {
        callback(e as CustomEvent<{ error: Error }>);
      }
    );
  }
}
