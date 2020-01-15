const Template = Symbol();

export type HtmlTemplate = {
  [Template]: [VDOM[], ArgValues];
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

export function createTemplate(vdom: VDOM[], args: ArgValues): HtmlTemplate {
  return { [Template]: [vdom, args] };
}

export function isTemplate(t: unknown): t is HtmlTemplate {
  return typeof t === "object" && t != null && Template in t;
}

export function isTemplateHavingKey(t: HtmlTemplate) {
  return getKey(t) != null;
}

export function isVNode(vdom: unknown): vdom is VNode {
  return vdom && !!(vdom as VNode).tag;
}

export function items(t: HtmlTemplate) {
  return t[Template];
}

export function getArgs(t: HtmlTemplate): ArgValues {
  return items(t)[1];
}

export function getKey(t: HtmlTemplate): unknown {
  const [vdom, args] = items(t);
  let key = isVNode(vdom[0]) && vdom[0]?.props?.[":key"];
  if (typeof key === "number") key = args[key];
  return key;
}

export function equalsTemplate(t1: HtmlTemplate, t2: HtmlTemplate) {
  return items(t1)[1][0] === items(t2)[1][0];
}
