import { render, TemplateResult } from "lit-html";

let currentCursor: number;
let currentComponent: Component;

export interface FunctionalComponent {
  (): TemplateResult;
}

interface EffectFn {
  (): void | CleanupFn;
}
interface CleanupFn {
  (): void;
}
export interface Hooks<T> {
  values: T[];
  deps: unknown[][];
  effects: EffectFn[];
  cleanup: CleanupFn[];
}

interface LifecycleFn<T> {
  (h: Hooks<T>, c: Component, i: number): T;
}

export function hooks<T>(config: {
  oncreate?: LifecycleFn<T>;
  onupdate?: LifecycleFn<T>;
}): T {
  const h = currentComponent.hooks as Hooks<T>;
  const index = currentCursor++;
  if (h.values.length <= index && config.oncreate) {
    h.values[index] = config.oncreate(h, currentComponent, index);
  }
  if (config.onupdate) {
    h.values[index] = config.onupdate(h, currentComponent, index);
  }
  return h.values[index];
}

export abstract class Component extends HTMLElement {
  private updating = false;
  public $root = this.attachShadow({ mode: "open" });
  public hooks: Hooks<unknown> = {
    values: [],
    deps: [],
    effects: [],
    cleanup: []
  };

  protected static functionalComponent: FunctionalComponent;

  protected connectedCallback() {
    this.update();
  }

  protected disconnectedCallback() {
    this.hooks.cleanup.forEach(f => f());
  }

  public update() {
    this.updating || this.enqueue();
  }

  private async enqueue() {
    this.updating = true;

    await Promise.resolve();

    currentCursor = 0;
    currentComponent = this;

    render(
      (this.constructor as typeof Component).functionalComponent(),
      this.$root,
      { eventContext: this }
    );

    this.affect();

    this.updating = false;
  }

  private affect() {
    const h = this.hooks;
    for (let i = 0; i < h.effects.length; i++) {
      if (h.effects[i]) {
        h.cleanup[i] && h.cleanup[i]();
        const cleanup = h.effects[i]();
        if (cleanup) {
          h.cleanup[i] = cleanup;
        }
        delete h.effects[i];
      }
    }
  }
}
