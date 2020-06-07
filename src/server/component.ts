/* eslint-disable @typescript-eslint/no-empty-function */

import {
  AttributeConverter,
  WithHooks,
  defaultHooks,
  __scope__,
  __def__,
} from "../fuco";
import { ArgValues, VNode } from "../html";
import { compose } from "./compose";
import { PropsManager } from "./props";

const noop = () => {};

const Contexts = new WeakMap<Record<string, unknown>, unknown>();

function getContext(component: ServerComponent) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (__def__[component.origVNode.tag] as any)._context;
}

export function setContext(component: ServerComponent) {
  const context = getContext(component);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context && Contexts.set(context, (component as any).value);
}

export function deleteContext(component: ServerComponent) {
  const context = getContext(component);
  context && Contexts.delete(context);
}

export function isComponent(vnode: VNode) {
  return !!__def__[vnode.tag];
}

export class ServerComponent implements WithHooks {
  _hooks = defaultHooks();
  _props: PropsManager;
  origVNode: VNode;

  constructor(vnode: VNode, args: ArgValues | undefined) {
    this.origVNode = vnode;
    this._props = new PropsManager(vnode.tag);

    if (vnode.props) {
      this._props.commit(vnode.props, args);
      delete this._props.properties.innerHTML;
      Object.assign(this, this._props.properties);
    }
  }

  getComposedVDOM(): VNode {
    const { tag, props, children } = this.origVNode;

    __scope__(this);
    const result = __def__[tag]();

    props && delete props[".innerHTML"];
    return {
      tag,
      props,
      children: [compose(result, children)],
    };
  }

  _attr<T>(name: string, converter: AttributeConverter<T>) {
    const value = this._props.attributes[name];
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

  _listen() {
    return noop;
  }

  _adoptStyle() {}
}
