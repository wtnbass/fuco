/* eslint-disable @typescript-eslint/no-empty-function */

import {
  AttributeConverter,
  FunctionalComponent,
  HookableComponent,
  defaultHooks,
  __setCurrent__
} from "../fuco";

export type CmpProps = { [key: string]: string };

export class Component implements HookableComponent {
  props: CmpProps;
  hooks = defaultHooks();
  result: unknown;

  constructor(fc: FunctionalComponent, props: CmpProps) {
    this.props = props;
    __setCurrent__(this);
    this.result = fc();
  }

  _attr<T>(name: string, converter: AttributeConverter<T>) {
    return converter ? converter(this.props[name]) : this.props[name];
  }

  _observeAttr() {}

  _dispatch() {}

  _adoptStyle() {}
}
