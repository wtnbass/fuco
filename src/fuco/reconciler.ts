import { Component } from "./component";
import { isBrowser } from "./env";

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

const lifo = <T>(q: T[]) => q.pop();

const microtask = (flush: () => void) => {
  return () => queueMicrotask(flush);
};

const task = (flush: () => void) => {
  if (isBrowser) {
    const ch = new MessageChannel();
    ch.port1.onmessage = flush;
    return () => ch.port2.postMessage(null);
  } else {
    return () => setImmediate(flush);
  }
};

export const enqueueLayoutEffects = batch<Component>(microtask, lifo, c =>
  c._flushEffects(c.hooks._layoutEffects)
);

export const enqueueEffects = batch<Component>(task, lifo, c =>
  c._flushEffects(c.hooks._effects)
);

export const enqueueUpdate = batch<Component>(microtask, fifo, c =>
  c._performUpdate()
);
