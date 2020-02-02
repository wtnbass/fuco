import { Component } from "./component";

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

export const enqueueLayoutEffects = batch<Component>(queueMicrotask, lifo, c =>
  c._flushEffects(c._hooks._layoutEffects)
);

export const enqueueEffects = batch<Component>(queueTask, lifo, c =>
  c._flushEffects(c._hooks._effects)
);

export const enqueueUpdate = batch<Component>(queueMicrotask, fifo, c =>
  c._performUpdate()
);
