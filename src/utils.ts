import { VDOM, Holes, HtmlKey, HtmlTemplate, VNode } from "./interfaces";

import "./global";

export function isVNode(vdom: unknown): vdom is VNode {
  return !!vdom && !!(vdom as VNode).tag;
}

export function getHoles(t: HtmlTemplate): Holes {
  return getHtmlTemplateProperties(t)[1];
}

export function getKey(t: unknown): HtmlKey {
  if (t == null) return t;
  return getHtmlTemplateProperties(t as HtmlTemplate)?.[2];
}

export function getHtmlTemplateProperties(
  template: HtmlTemplate
): [VDOM[], Holes, HtmlKey] {
  return template[$fucoGlobal.__HtmlTemplate];
}

export function isHtmlTemplate(value: unknown): value is HtmlTemplate {
  return !!value && getHtmlTemplateProperties(value as HtmlTemplate) != null;
}

export function equalsHtmlTemplate(t1: HtmlTemplate, t2: HtmlTemplate) {
  return getHoles(t1)[0] === getHoles(t2)[0];
}

export function isIterable(value: unknown): value is Iterable<unknown> {
  return (
    Array.isArray(value) ||
    !!(
      value &&
      typeof value !== "string" &&
      (value as Iterable<unknown>)[Symbol.iterator]
    )
  );
}

export function isText(t: unknown): t is unknown {
  return t != null && !isHtmlTemplate(t);
}
