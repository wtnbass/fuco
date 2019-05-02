import { Provider } from "./provider";

export interface Context<T> {
  readonly initialValue?: T;
  readonly id: number;
  readonly defineProvider: (name: string) => void;
}

let contextId = 0;

export function createContext<T>(initialValue?: T): Context<T> {
  const id = contextId++;

  return {
    initialValue,
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
