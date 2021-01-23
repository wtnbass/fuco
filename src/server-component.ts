import {
  Holes,
  Component,
  AttributeConverter,
  VNode,
  CssTemplate,
} from "./interfaces";
import { contextTypePrefix } from "./consts";
import { defaultHooks, setScope } from "./hooks";
import { getCssString } from "./css";
import { ServerProps } from "./server-props";

import "./global";

const contextCache = new WeakMap<Record<string, unknown>, unknown>();

const noop = () => {};

export const isComponent = (vnode: VNode) => !!$fucoGlobal.__defs[vnode.tag];

export class ServerComponent implements Component {
  _componentName: string;
  _hooks = defaultHooks();
  _connected = false;
  _dirty = false;
  _props: ServerProps;
  _result: unknown;
  _style = "";

  constructor(vnode: VNode, holes?: Holes) {
    this._componentName = vnode.tag;
    this._props = new ServerProps(vnode.tag);
    if (vnode.props) {
      this._props.commit(vnode.props, holes);
      delete this._props.properties.innerHTML;
      Object.assign(this, this._props.properties);
    }
  }

  connected() {
    const fc = $fucoGlobal.__defs[this._componentName];
    const ctx = (fc as any)._context;
    ctx && contextCache.set(ctx, this._props.properties.value);

    setScope(this);
    this._result = fc();
  }

  disconnected() {
    const fc = $fucoGlobal.__defs[this._componentName];
    const ctx = (fc as any)._context;
    ctx && contextCache.delete(ctx);
  }

  _render = noop;

  _attr<T>(name: string, converter: AttributeConverter<T>) {
    const value = this._props.attributes[name];
    return converter ? converter(value) : value;
  }

  _observeAttr() {
    return noop;
  }

  _dispatch(name: string, init: CustomEventInit) {
    /* istanbul ignore else */
    if (name.startsWith(contextTypePrefix)) {
      const context = init.detail._context;
      const register = init.detail._register;
      if (contextCache.has(context)) {
        register(noop)(contextCache.get(context));
      }
    }
  }

  _listen() {
    return noop;
  }

  _adoptStyle(css: CssTemplate) {
    this._style += getCssString(css);
  }
}
