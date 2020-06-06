import { render } from "../html";
import { isBrowser } from "./env";
import { adoptCssStyle, HasCSSSymbol } from "./css";
import {
  __scope__,
  defaultHooks,
  WithHooks,
  AttributeConverter,
  Listener
} from "./hook";
import { enqueueUpdate, unmount } from "./reconciler";

export interface Component extends WithHooks {
  _name: string;
  _connected: boolean;
  _dirty: boolean;
  _render(): void;
  _parent: HTMLElement | null;
}

export type FunctionalComponent = () => unknown;

export const __def__: { [name: string]: FunctionalComponent } = {};

export function defineElement(name: string, fn: FunctionalComponent) {
  if (isBrowser) {
    customElements.define(
      name,
      class extends HTMLElement implements Component {
        public _name = name;
        public _dirty = false;
        public _connected = false;
        private _container = this.attachShadow({ mode: "open" });
        public _hooks = defaultHooks();
        public _parent: HTMLElement | null = null;

        protected connectedCallback() {
          this._connected = true;
          this._parent = this.parentElement;
          enqueueUpdate(this);
        }

        protected disconnectedCallback() {
          this._connected = false;
          unmount(this);
          this._parent = null;
        }

        public _render() {
          __scope__(this);
          render(fn(), this._container);
        }

        public _attr<T>(name: string, converter?: AttributeConverter<T>) {
          return converter
            ? converter(this.getAttribute(name))
            : this.getAttribute(name);
        }
        public _observeAttr(name: string, callback: () => void) {
          const m = new MutationObserver(callback);
          m.observe(this, { attributes: true, attributeFilter: [name] });
          return () => m.disconnect();
        }

        public _dispatch<T>(name: string, init: CustomEventInit<T>) {
          this.dispatchEvent(new CustomEvent<T>(name, init));
        }

        public _listen<T extends Event>(name: string, listener: Listener<T>) {
          this.addEventListener(name, listener as EventListener);
          return () => {
            this.removeEventListener(name, listener as EventListener);
          };
        }

        public _adoptStyle(css: HasCSSSymbol) {
          adoptCssStyle(this._container, css);
        }
      }
    );
  } else {
    __def__[name] = fn;
  }
}
