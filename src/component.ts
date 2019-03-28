import { render, TemplateResult } from "lit-html";
import {
  Hook,
  EffectHook,
  setCurrent,
  getProperties,
  createInitElement
} from "./hooks";

export interface ComponentClass {
  new (...args: any[]): Component;
  prototype: Component;
}

export class Component extends HTMLElement {
  public rootElement = this.attachShadow({ mode: "open" });
  public hooks: Hook[] = [];
  public effects: EffectHook[] = [];

  protected static initialize() {}

  protected render() {}

  public update() {
    setCurrent(this, 0);
    this.render();

    this.effects.forEach(hook => {
      if (hook.cleanup) hook.cleanup();
      if (hook.handler) {
        const cleanup = hook.handler();
        if (typeof cleanup === "function") {
          hook.cleanup = cleanup;
        }
      }
    });
    this.effects = [];
  }

  protected static get observedAttributes() {
    setCurrent(createInitElement(), 0);
    this.initialize();
    return getProperties();
  }

  protected attributeChangedCallback() {
    this.update();
  }

  protected connectedCallback() {
    this.update();
  }

  protected disconnectedCallback() {
    this.hooks.forEach(hook => {
      const h = hook as EffectHook;
      if (h.cleanup) h.cleanup();
    });
  }
}

export type FunctionalComponent = () => TemplateResult;

export function defineElement(
  name: string,
  func: FunctionalComponent
): ComponentClass {
  let C = class extends Component {
    protected static initialize() {
      func();
    }
    protected render() {
      render(func(), this.rootElement);
    }
  };
  window.customElements.define(name, C);
  return C;
}
