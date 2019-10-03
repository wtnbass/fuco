import { Hooks, enqueueUpdate } from "./update";

export abstract class Component extends HTMLElement {
  public abstract render(): void;
  public _dirty = false;
  public _connected = false;
  public $root = this.attachShadow({ mode: "open" });
  public hooks: Hooks<unknown> = {
    values: [],
    deps: [],
    effects: [],
    layoutEffects: [],
    cleanup: []
  };

  protected connectedCallback() {
    this._connected = true;
    this.update();
  }

  protected disconnectedCallback() {
    this._connected = false;
    const cleanups = this.hooks.cleanup;
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

  public flushEffects(effects: (() => void | (() => void))[]) {
    const cleanups = this.hooks.cleanup;
    for (let i = 0; i < effects.length; i++) {
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
}
