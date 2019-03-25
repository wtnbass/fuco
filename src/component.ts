import {
  Hook,
  UseEffectHook,
  setCurrent,
  getProperties,
  InitElement
} from "./hooks";

export interface ComponentClass {
  new (...args: any[]): Component;
  prototype: Component;
}

export class Component extends HTMLElement {
  hooks: Hook[] = [];
  effects: UseEffectHook[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.hooks = [];
    this.effects = [];
    this.update();
  }

  protected static initialize() {}

  protected render() {}

  public update() {
    setCurrent(this, 0);
    this.render();

    this.effects.forEach(hook => {
      if (hook.cleanup) hook.cleanup();
      if (hook.handler) hook.cleanup = hook.handler();
    });
    this.effects = [];
  }

  protected static get observedAttributes() {
    setCurrent(createInitElement(), 0);
    this.initialize();
    return getProperties();
  }

  protected attributeChangedCallback() {
    this.render();
  }

  protected disconnectedCallback() {
    this.hooks.forEach(hook => {
      const h = hook as UseEffectHook;
      if (h.cleanup) h.cleanup();
    });
  }
}

function createInitElement(): InitElement {
  return {
    __init: {
      properties: []
    }
  };
}
