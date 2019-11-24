import { update, enqueueUpdate, flushCallbacks, Hooks } from "./update";

export abstract class Component extends HTMLElement {
  private _dirty = false;
  private _connected = false;
  public abstract render(): void;
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
      update(this);
    } catch (e) {
      console.error(e);
    }
    this._dirty = false;
  }
}

export type FunctionalComponent = () => unknown;

export function makeDifine(
  renderer: (fn: FunctionalComponent, cmp: Component) => void
) {
  return function defineElement(name: string, fn: FunctionalComponent) {
    customElements.define(
      name,
      class extends Component {
        public render() {
          renderer(fn, this);
        }
      }
    );
  };
}
