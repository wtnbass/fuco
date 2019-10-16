let currentCursor: number;
let currentComponent: Component;

export interface Hooks<T> {
  values: T[];
  deps: unknown[][];
  effects: (() => void | (() => void))[];
  layoutEffects: (() => void | (() => void))[];
  cleanup: (() => void)[];
}

export function hooks<T>(config: {
  oncreate?: (h: Hooks<T>, c: Component, i: number) => T;
  onupdate?: (h: Hooks<T>, c: Component, i: number) => T;
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

const flushCallbacks = (callbacks: (() => void)[]) => {
  for (let i = 0, len = callbacks.length; i < len; i++) {
    if (callbacks[i]) {
      callbacks[i]();
      delete callbacks[i];
    }
  }
};

const flushEffects = (
  hooks: Hooks<unknown>,
  key: keyof Pick<Hooks<unknown>, "effects" | "layoutEffects">
) => {
  const effects = hooks[key];
  const cleanups = hooks.cleanup;
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
};

const batch = <T>(
  runner: (f: () => void) => () => void,
  pick: (p: T[]) => T | undefined,
  callback: (p: T) => void
) => {
  const q: T[] = [];
  const flush = () => {
    let p;
    while ((p = pick(q))) callback(p);
  };
  const run = runner(flush);
  return (c: T) => q.push(c) === 1 && run();
};

const fifo = <T>(q: T[]) => q.shift();

const filo = <T>(q: T[]) => q.pop();

const microtask = (flush: () => void) => {
  return () => queueMicrotask(flush);
};

const task = (flush: () => void) => {
  const ch = new MessageChannel();
  ch.port1.onmessage = flush;
  return () => ch.port2.postMessage(null);
};

const enqueueUpdate = batch<Component>(microtask, fifo, c => c.performUpdate());

const commitLayoutEffects = batch<Component>(microtask, filo, c =>
  flushEffects(c.hooks, "layoutEffects")
);

const commitEffects = batch<Component>(task, filo, c =>
  flushEffects(c.hooks, "effects")
);

export abstract class Component extends HTMLElement {
  private _dirty = false;
  private _connected = false;
  protected abstract render(): void;
  public $root = this.attachShadow({ mode: "open" });
  public renderCallback: (() => void)[] = [];
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
    flushCallbacks(this.hooks.cleanup);
  }

  public update() {
    if (this._dirty) return;
    this._dirty = true;
    enqueueUpdate(this);
  }

  public performUpdate() {
    if (!this._connected) return;
    try {
      currentCursor = 0;
      currentComponent = this;
      this.render();
      flushCallbacks(this.renderCallback);
      commitLayoutEffects(this);
      commitEffects(this);
    } catch (e) {
      console.error(e);
    }
    this._dirty = false;
  }
}
