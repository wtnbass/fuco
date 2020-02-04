/* eslint-disable @typescript-eslint/no-empty-function */

import {
  AttributeConverter,
  Component,
  defaultHooks,
  __scope__,
  __def__
} from "../fuco";
import { VProps, ArgValues, VNode } from "../html";
import { compose } from "./compose";

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

  constructor(vnode: VNode, args: ArgValues | undefined) {
    this.origVNode = vnode;
    this.args = args;
    if (vnode.props) {
      const assignProperty = (props: VProps) => {
        for (const key in props) {
          if (key === "...") {
            let spread = props["..."];
            /* istanbul ignore else */
            if (typeof spread === "number" && args) {
              spread = args[spread];
            }
            assignProperty(spread as VProps);
          } else if (key[0] === "." && key !== ".innerHTML") {
            let value = props[key];
            if (typeof value === "number" && args) {
              value = args[value];
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any)[key.slice(1)] = value;
          }
        }
      };
      assignProperty(vnode.props);
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
    let value: string | null = null;
    /* istanbul ignore else */
    if (this.origVNode.props) {
      const setValue = (props: VProps) => {
        if (name in props) {
          let pvalue = props[name];
          if (typeof pvalue === "number" && this.args) {
            pvalue = this.args[pvalue];
          }
          value = String(pvalue);
        } else if (`?${name}` in props) {
          let pvalue = props[`?${name}`];
          /* istanbul ignore else */
          if (typeof pvalue === "number" && this.args) {
            pvalue = this.args[pvalue];
          }
          if (pvalue) value = "";
        } else if ("..." in props) {
          let spread = props["..."];
          /* istanbul ignore else */
          if (typeof spread === "number" && this.args) {
            spread = this.args[spread];
          }
          setValue(spread as VProps);
        }
      };
      setValue(this.origVNode.props);
    }
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
