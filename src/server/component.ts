/* eslint-disable @typescript-eslint/no-empty-function */

import {
  AttributeConverter,
  Component,
  defaultHooks,
  __scope__,
  __def__
} from "../fuco";
import { ArgValues, VNode } from "../html";
import { compose } from "./compose";
import { createParent, propsToParent } from "./props";

const noop = () => {};

const Contexts = new WeakMap<object, unknown>();

export function setContext(component: ServerComponent) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = (component.__fc__ as any)._context;
  if (context && context.Provider === component.__fc__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Contexts.set(context, (component as any).value);
  }
}

export function deleteContext(component: ServerComponent) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = (component.__fc__ as any)._context;
  context && Contexts.delete(context);
}

export function isComponent(vnode: VNode) {
  return !!__def__[vnode.tag];
}

export class ServerComponent implements Component {
  _hooks = defaultHooks();
  origVNode: VNode;
  args: ArgValues | undefined;
  attributes: { [key: string]: string } = {};

  constructor(vnode: VNode, args: ArgValues | undefined) {
    this.origVNode = vnode;
    this.args = args;
    if (vnode.props) {
      const parent = createParent(this.origVNode.tag);
      propsToParent(parent, vnode.props, args);
      this.attributes = parent.attributes;
      Object.assign(this, parent.properties);
    }
  }
  get __fc__() {
    return __def__[this.origVNode.tag];
  }

  getComposedVDOM(): VNode {
    __scope__(this);
    const result = this.__fc__();

    const { tag, props, children } = this.origVNode;
    props && delete props[".innerHTML"];
    return { tag, props, children: [compose(result, children)] };
  }

  update() {}

  _performUpdate() {}

  _flushEffects() {}

  _attr<T>(name: string, converter: AttributeConverter<T>) {
    const value = this.attributes[name];
    return converter ? converter(value) : value;
  }

  _observeAttr() {
    return noop;
  }

  _dispatch(name: string, init: CustomEventInit) {
    /* istanbul ignore else */
    if (/^fuco:context:[0-9]+$/.test(name)) {
      const context = init.detail._context;
      const register = init.detail._register;
      if (Contexts.has(context)) {
        register(noop)(Contexts.get(context));
      }
    }
  }

  _adoptStyle() {}
}
