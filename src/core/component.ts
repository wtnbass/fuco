import { isBrowser } from "../shared/env";
import { render } from "../html";
import {
  enqueueEffects,
  enqueueLayoutEffects,
  enqueueUpdate
} from "./reconciler";

export interface Hooks<T> {
  values: T[];
  deps: Deps[];
  effects: EffectFn[];
  layoutEffects: EffectFn[];
  cleanup: Cleanup[];
}

export type Deps = unknown[];

export type EffectFn = () => void | Cleanup;

export type Cleanup = () => void;

let currentCursor: number;
let currentComponent: Component;

export function hooks<T>(config: {
  oncreate?: (h: Hooks<T>, c: Component, i: number) => T;
  onupdate?: (h: Hooks<T>, c: Component, i: number) => T;
  onSSR?: (h: Hooks<T>, c: Component, i: number) => T;
}): T {
  const h = currentComponent.hooks as Hooks<T>;
  const index = currentCursor++;
  if (currentComponent instanceof Component) {
    if (h.values.length <= index && config.oncreate) {
      h.values[index] = config.oncreate(h, currentComponent, index);
    }
    if (config.onupdate) {
      h.values[index] = config.onupdate(h, currentComponent, index);
    }
  } else {
    config.onSSR && config.onSSR(h, currentComponent, index);
  }
  return h.values[index];
}

export abstract class Component extends HTMLElement {
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

  public abstract render(): void;

  protected connectedCallback() {
    this._connected = true;
    this.update();
  }

  protected disconnectedCallback() {
    this._connected = false;
    const cleanups = this.hooks.cleanup;
    for (let i = 0, len = cleanups.length; i < len; i++) {
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
      currentCursor = 0;
      currentComponent = this;
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
}

export type FunctionalComponent = () => unknown;

export const functionalComponents: { [name: string]: FunctionalComponent } = {};

export function defineElement(name: string, fn: FunctionalComponent) {
  if (isBrowser) {
    customElements.define(
      name,
      class extends Component {
        public render() {
          render(fn(), this.$root);
        }
      }
    );
  } else {
    functionalComponents[name] = fn;
  }
}
