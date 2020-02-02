import { adoptCssStyle, HasCSSSymbol } from "./css";
import { defaultHooks, __setCurrent__, EffectFn, FucoComponent } from "./hook";
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

export abstract class Component extends HTMLElement implements FucoComponent {
  private _dirty = false;
  private _connected = false;
  private _container = this.attachShadow({ mode: "open" });
  public _hooks = defaultHooks();

  public abstract renderer(node: Node): void;

  protected connectedCallback() {
    this._connected = true;
    this.update();
  }

  protected disconnectedCallback() {
    this._connected = false;
    const cleanups = this._hooks._cleanup;
    for (let i = 0; i < cleanups.length; i++) {
      if (cleanups[i]) {
        cleanups[i]();
        delete cleanups[i];
      }
    }
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
      this.renderer(this._container);
      enqueueLayoutEffects(this);
      enqueueEffects(this);
    } catch (e) {
      console.error(e);
    }
    this._dirty = false;
  }

  public _flushEffects(effects: EffectFn[]) {
    const cleanups = this._hooks._cleanup;
    for (let i = 0, len = effects.length; i < len; i++) {
      if (effects[i]) {
        cleanups[i] && cleanups[i]();
        const cleanup = effects[i]();
        if (typeof cleanup === "function") {
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
    const m = new MutationObserver(callback);
    m.observe(this, { attributes: true, attributeFilter: [name] });
    return () => m.disconnect();
  }

  public _dispatch<T>(name: string, init: CustomEventInit<T>) {
    this.dispatchEvent(new CustomEvent<T>(name, init));
  }

  public _adoptStyle(css: HasCSSSymbol) {
    adoptCssStyle(this._container, css);
  }
}
