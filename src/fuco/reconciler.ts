import { Component } from "./component";
import { EffectFn, WithHooks } from "./hook";
import { invokeCatchError } from "./error";

const batch = <T>(
  queue: (f: () => void) => void,
  pick: (p: T[]) => T | undefined,
  callback: (p: T) => void
) => {
  const q: T[] = [];
  const flush = () => {
    let p;
    while ((p = pick(q))) callback(p);
  };
  return (c: T) => q.push(c) === 1 && queue(flush);
};

const fifo = <T>(q: T[]) => q.shift();

const lifo = <T>(q: T[]) => q.pop();

const queueTask = (callback: () => void) => {
  try {
    const ch = new MessageChannel();
    ch.port1.onmessage = callback;
    ch.port2.postMessage(null);
  } catch (_) {
    /* istanbul ignore next */
    setImmediate(callback);
  }
};

export const renderComponent = invokeCatchError((c) => {
  if (!(c as Component)._connected) return;
  (c as Component)._render();
  enqueueLayoutEffects(c);
  enqueueEffects(c);
  (c as Component)._dirty = false;
});

const flushEffects = invokeCatchError((c, effects: EffectFn[]) => {
  const cleanups = c._hooks._cleanup;
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
});

export const unmount = invokeCatchError((c: WithHooks) => {
  const cleanups = c._hooks._cleanup;
  for (let i = 0; i < cleanups.length; i++) {
    if (cleanups[i]) {
      cleanups[i]();
      delete cleanups[i];
    }
  }
});

const enqueueLayoutEffects = batch<Component>(queueMicrotask, lifo, (c) =>
  flushEffects(c, c._hooks._layoutEffects)
);

const enqueueEffects = batch<Component>(queueTask, lifo, (c) =>
  flushEffects(c, c._hooks._effects)
);

const processUpdate = batch<Component>(queueMicrotask, fifo, (c) =>
  renderComponent(c as Component)
);

export const enqueueUpdate = (c: Component) =>
  !c._dirty && (c._dirty = true) && processUpdate(c);
