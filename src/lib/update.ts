import { Component } from "./component";

let currentCursor: number;
let currentComponent: Component;

type QueueCallback<T> = (t: T) => void;

const queue = <T>(callback: QueueCallback<T>) => {
  const q: T[] = [];
  const enqueue = () => {
    let p;
    while ((p = q.pop())) callback(p);
  };
  return [q, enqueue] as const;
};

const microtask = <T>(callback: QueueCallback<T>) => {
  const [q, enqueue] = queue(callback);
  return (c: T) => q.push(c) === 1 && queueMicrotask(enqueue);
};

const task = <T>(callback: QueueCallback<T>) => {
  const [q, enqueue] = queue(callback);
  const ch = new MessageChannel();
  ch.port1.onmessage = enqueue;
  return (c: T) => q.push(c) === 1 && ch.port2.postMessage(null);
};

const commitLayoutEffects = microtask<Component>(c =>
  c.flushEffects(c.hooks.layoutEffects)
);

const commitEffects = task<Component>(c => c.flushEffects(c.hooks.effects));

export const enqueueUpdate = microtask<Component>(c => {
  if (!c._connected) return;
  try {
    currentCursor = 0;
    currentComponent = c;
    c.render();
    commitLayoutEffects(c);
    commitEffects(c);
  } catch (e) {
    console.error(e);
  }
  c._dirty = false;
});

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
