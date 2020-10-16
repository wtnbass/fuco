import { isBrowser, supportsAdoptedStyleSheets } from "./env";
import { setScope, defaultHooks } from "./hooks";
import { enqueueUpdate, unmount } from "./reconciler";
import { getCssString } from "./css";
import {
  FC,
  Component,
  AttributeConverter,
  Listener,
  CssTemplate,
} from "./interfaces";
import { render } from "./html";

import "./global";

export function defineElement(componentName: string, fc: FC) {
  $fucoGlobal.__defs[componentName] = fc;
  isBrowser &&
    customElements.define(
      componentName,
      class extends HTMLElement implements Component {
        public _componentName = componentName;
        public _hooks = defaultHooks();
        public _dirty = false;
        public _connected = false;
        private _container = this.attachShadow({ mode: "open" });

        protected connectedCallback() {
          this._connected = true;
          enqueueUpdate(this);
        }

        protected disconnectedCallback() {
          this._connected = false;
          unmount(this);
        }

        public _render() {
          setScope(this);
          render(fc(), this._container);
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

        public _adoptStyle(css: CssTemplate) {
          const cssStyle = getCssString(css);
          if (supportsAdoptedStyleSheets) {
            const styleSheet = new CSSStyleSheet();
            styleSheet.replace(cssStyle);
            this._container.adoptedStyleSheets = [
              ...this._container.adoptedStyleSheets,
              styleSheet,
            ];
          } else {
            this._container.appendChild(
              document.createElement("style")
            ).textContent = cssStyle;
          }
        }
      }
    );
}
