import { render, TemplateResult } from "lit-html";

let currentCursor: number;
let currentComponent: Component;

export type FunctionalComponent = () => TemplateResult;

type EffectFn = () => void | CleanupFn;

type CleanupFn = () => void;

export interface Hooks<T> {
  values: T[];
  deps: unknown[][];
  effects: EffectFn[];
  cleanup: CleanupFn[];
}

export function hooks<T>(
  first: (h: Hooks<T>, c: Component, i: number) => T,
  always = false
): T {
  const h = currentComponent.hooks as Hooks<T>;
  const index = currentCursor++;
  if (always || h.values.length <= index) {
    h.values[index] = first(h, currentComponent, index);
  }
  return h.values[index];
}

export abstract class Component extends HTMLElement {
  private updating = false;
  public rootElement = this.attachShadow({ mode: "open" });
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
      this.rootElement,
      { eventContext: this }
    );

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

    this.updating = false;
  }
}
