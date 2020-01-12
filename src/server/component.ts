/* eslint-disable @typescript-eslint/no-empty-function */

import { defaultHooks, setCurrent } from "../core/hook";
import { AttributeConverter, FucoComponent } from "../core/component";
import { FunctionalComponent } from "../core/define-element";
export type CmpProps = { [key: string]: string };

export class Component implements FucoComponent {
  props: CmpProps;
  hooks = defaultHooks();
  result: unknown;

  constructor(fc: FunctionalComponent, props: CmpProps) {
    this.props = props;
    setCurrent(this);
    this.result = fc();
  }

  _attr<T>(name: string, converter: AttributeConverter<T>) {
    return converter ? converter(this.props[name]) : this.props[name];
  }

  _observeAttr() {}

  _dispatch() {}

  _adoptStyle() {}
}
