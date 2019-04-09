import { Provider } from "./provider";

export interface Context {
  readonly id: number;
  readonly defineProvider: (name: string) => void;
}

let contextId = 0;

export function createContext<T>(): Context {
  const id = contextId++;

  return {
    id,
    defineProvider(name: string) {
      window.customElements.define(
        name,
        class extends Provider<T> {
          protected get contextId() {
            return id;
          }
        }
      );
    }
  };
}
