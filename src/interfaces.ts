export type FunctionComponent = () => unknown;

export type FunctionalComponent = FunctionComponent;

export type FC = FunctionComponent;

export type Component = {
  _componentName: string;
  _connected: boolean;
  _dirty: boolean;
  _render(): void;
  _hooks: Hooks<unknown>;
  _attr<T>(name: string, converter?: AttributeConverter<T>): T | string | null;
  _observeAttr(name: string, callback: () => void): Cleanup;
  _dispatch<T>(name: string, init: CustomEventInit<T>): void;
  _listen<T extends Event>(name: string, listener: Listener<T>): Cleanup;
  _adoptStyle(css: CssTemplate): void;
};

export type Hooks<T> = {
  _values: T[];
  _deps: Deps[];
  _effects: EffectFn[];
  _layoutEffects: EffectFn[];
  _cleanup: Cleanup[];
};

export type Deps = unknown[];

export type EffectFn = () => void | Cleanup;

export type Cleanup = () => void;

export type AttributeConverter<T> = (attr: string | null) => T;

export type Listener<T extends Event> = (evt: T) => void;

export interface Context<T> {
  readonly _defaultValue?: T;
  readonly Provider: FC;
}

export interface ContextDetail<T> {
  _context: Context<T>;
  _register(
    subscribe: (s: ContextSubscriber<T>) => Cleanup
  ): ContextSubscriber<T>;
}

export type ContextSubscriber<T> = (value: T) => void;

export type CssTemplate = { [$fucoGlobal.__CssTemplate]: string };

export type HtmlTemplate = {
  [$fucoGlobal.__HtmlTemplate]: [VDOM[], Holes, HtmlKey];
};

export type VDOM = VNode | VText | VHole;

export type VNode = {
  tag: string;
  props?: VProps;
  children: VDOM[];
};

export type VProps = { [name: string]: VPropValue };

export type VPropValue = VText | VHole | VProps;

export type VText = string;

export type VHole = number;

export type Holes = IArguments | Array<unknown>;

export type HtmlKey = unknown;
