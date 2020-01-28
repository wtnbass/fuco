export interface Context<T> {
  readonly initialValue?: T;
  readonly defineProvider: (name: string) => void;
}

export interface Detail<T> {
  context: Context<T>;
  register(provider: Provider<T>): void;
}

export const REQUEST_CONSUME =
  "context:request-consume:" + String(Math.random()).slice(2);

export abstract class Provider<T> extends HTMLElement {
  protected abstract get context(): Context<T>;

  private _value: T | undefined;
  private _listeners: (() => void)[] = [];

  public constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      document.createElement("slot")
    );
  }

  protected connectedCallback() {
    this.addEventListener(REQUEST_CONSUME, e => {
      const { detail } = e as CustomEvent<Detail<T>>;

      if (this.context === detail.context) {
        e.stopPropagation();
        detail.register(this);
      }
    });
  }

  public subscribe(subscriber: () => void) {
    this._listeners.push(subscriber);
    return () => {
      const index = this._listeners.indexOf(subscriber);
      this._listeners.splice(index, 1);
    };
  }

  public get value() {
    return this._value;
  }

  public set value(newValue) {
    this._value = newValue;
    this._listeners.forEach(l => l());
  }
}

export function createContext<T>(initialValue?: T): Context<T> {
  return {
    initialValue,
    defineProvider(name: string) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context = this;
      window.customElements.define(
        name,
        class extends Provider<T> {
          protected get context() {
            return context;
          }
        }
      );
    }
  };
}
