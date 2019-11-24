const Template = Symbol();

export type HtmlTemplate = {
  [Template]: [VDOM, ArgValues, Key?];
};

export type VDOM = VNode | VText | VArg;

export type VNode = {
  tag: string;
  props?: VProps;
  children: VDOM[];
};

export type VProps = { [name: string]: VPropValue };

export type VPropValue = VText | VArg | VProps;

export type VText = string;

export type VArg = number;

export type ArgValues = IArguments | Array<unknown>;

export type Key = unknown;

export function createTemplate(
  vdom: VDOM,
  args: ArgValues,
  key?: Key
): HtmlTemplate {
  return { [Template]: [vdom, args, key] };
}

export function isTemplate(t: unknown): t is HtmlTemplate {
  return typeof t === "object" && t != null && Template in t;
}

export function isTemplateHavingKey(t: HtmlTemplate) {
  return t[Template][2] != null;
}

export function isVNode(vdom: VDOM): vdom is VNode {
  return !!(vdom as VNode).tag;
}

export function items(t: HtmlTemplate) {
  return t[Template];
}

export function getArgs(t: HtmlTemplate): ArgValues {
  return items(t)[1];
}

export function getKey(t: HtmlTemplate): Key {
  return items(t)[2];
}

export function equalsTemplate(t1: HtmlTemplate, t2: HtmlTemplate) {
  return items(t1)[1][0] === items(t2)[1][0];
}
