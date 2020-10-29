import { Component, EffectFn } from "./interfaces";
import { invokeCatchError } from "./error";

const batch = <T>(queue: (f: () => void) => void, callback: (p: T) => void) => {
  const q: T[] = [];
  const flush = () => {
    let p;
    while ((p = q.shift())) callback(p);
  };
  return (c: T) => q.push(c) === 1 && queue(flush);
};

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
  if (!c._connected) return;
  c._render();
  enqueueLayoutEffects(c);
  enqueueEffects(c);
  c._dirty = false;
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
      // istanbul-ignore-next
      if (process.env.BUILD_ENV === "development") {
        if (cleanup != null && typeof cleanup !== "function") {
          console.warn("An effect function must return a function. You returned:", cleanup);
        }
      }
      delete effects[i];
    }
  }
});

export const unmount = invokeCatchError((c: Component) => {
  const cleanups = c._hooks._cleanup;
  for (let i = 0; i < cleanups.length; i++) {
    if (cleanups[i]) {
      cleanups[i]();
      delete cleanups[i];
    }
  }
});

const enqueueLayoutEffects = batch<Component>(queueMicrotask, (c) =>
  flushEffects(c, c._hooks._layoutEffects)
);

const enqueueEffects = batch<Component>(queueTask, (c) =>
  flushEffects(c, c._hooks._effects)
);

const processUpdate = batch<Component>(queueMicrotask, (c) =>
  renderComponent(c as Component)
);

export const enqueueUpdate = (c: Component) =>
  !c._dirty && (c._dirty = true) && processUpdate(c);
