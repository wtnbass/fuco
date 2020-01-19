import { adoptCssStyle, HasCSSSymbol } from "./css";
import { defaultHooks, Hooks, HookableComponent, __setCurrent__ } from "./hook";
import {
  enqueueEffects,
  enqueueLayoutEffects,
  enqueueUpdate
} from "./reconciler";
import { isBrowser } from "./env";

export interface AttributeConverter<T> {
  (attr: string | null): T;
}

if (!isBrowser) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).HTMLElement = Function;
}

export abstract class Component extends HTMLElement
  implements HookableComponent {
  public _dirty = false;
  public _connected = false;
  public $root = this.attachShadow({ mode: "open" });
  public hooks = defaultHooks();

  public abstract render(): void;

  protected connectedCallback() {
    this._connected = true;
    this.update();
  }

  protected disconnectedCallback() {
    this._connected = false;
    let cleanup;
    while ((cleanup = this.hooks.cleanup.shift())) cleanup();
  }

  public update() {
    if (this._dirty) return;
    this._dirty = true;
    enqueueUpdate(this);
  }

  public _performUpdate() {
    if (!this._connected) return;
    try {
      __setCurrent__(this);
      this.render();
      enqueueLayoutEffects(this);
      enqueueEffects(this);
    } catch (e) {
      console.error(e);
    }
    this._dirty = false;
  }

  public _flushEffects(
    effectKey: keyof Pick<Hooks<unknown>, "effects" | "layoutEffects">
  ) {
    const effects = this.hooks[effectKey];
    const cleanups = this.hooks.cleanup;
    for (let i = 0, len = effects.length; i < len; i++) {
      if (effects[i]) {
        cleanups[i] && cleanups[i]();
        const cleanup = effects[i]();
        if (cleanup) {
          cleanups[i] = cleanup;
        }
        delete effects[i];
      }
    }
  }

  public _attr<T>(name: string, converter?: AttributeConverter<T>) {
    return converter
      ? converter(this.getAttribute(name))
      : this.getAttribute(name);
  }
  public _observeAttr(name: string, callback: () => void) {
    const m = new MutationObserver(() => callback());
    m.observe(this, { attributes: true, attributeFilter: [name] });
    return () => m.disconnect();
  }

  public _dispatch<T>(name: string, init: CustomEventInit<T>) {
    this.dispatchEvent(new CustomEvent<T>(name, init));
  }

  public _adoptStyle(css: HasCSSSymbol) {
    adoptCssStyle(this.$root, css);
  }
}
