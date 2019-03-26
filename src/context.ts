import { Component } from "./component";

export interface Context<T> {
  components: Component[];
  value: T;
}

export function createContext<T>(defaultValue: T) {
  let context: Context<T> = {
    components: [],
    value: defaultValue
  };

  return new Proxy(context, {
    set(target, name, value) {
      (target as any)[name] = value;
      if (name === "value") {
        target.components.forEach(c => c.update());
      }
      return true;
    }
  });
}
