/* eslint-disable @typescript-eslint/no-empty-function */

import {
  AttributeConverter,
  FunctionalComponent,
  Component,
  defaultHooks,
  __scope__
} from "../fuco";
import { VProps, ArgValues } from "../html";

type CmpProps = { [key: string]: unknown };

export class DummyComponent implements Component {
  _hooks = defaultHooks();
  props: CmpProps;
  result: unknown;

  constructor(
    fc: FunctionalComponent,
    props: VProps | undefined,
    args: ArgValues | undefined
  ) {
    this.props = createCmpProps(this, props, args);
    __scope__(this);
    this.result = fc();
  }

  update() {}

  _performUpdate() {}

  _flushEffects() {}

  _attr<T>(name: string, converter: AttributeConverter<T>) {
    const value = this.props[name] != null ? String(this.props[name]) : null;
    return converter ? converter(value) : value;
  }

  _observeAttr() {
    return () => {};
  }

  _dispatch() {}

  _adoptStyle() {}
}

function createCmpProps(
  component: Component,
  props: VProps | undefined,
  args: ArgValues | undefined
) {
  const cmpProps: CmpProps = {};
  if (props) {
    const resolveArgs = (_props: VProps) => {
      for (const key in _props) {
        let value = _props[key];
        if (typeof value === "number" && args) {
          value = args[value];
        }
        if (key[0] === "@" || key === ":key" || key === ":ref") {
          continue;
        } else if (key === "...") {
          resolveArgs(value as VProps);
        } else if (key[0] === "?") {
          cmpProps[key.slice(1)] = value ? "" : null;
        } else if (key[0] === ".") {
          (component as Component & { [k: string]: unknown })[
            key.slice(1)
          ] = value;
        } else {
          cmpProps[key] = value;
        }
      }
    };
    resolveArgs(props);
  }
  return cmpProps;
}
