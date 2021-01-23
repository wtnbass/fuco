import { VDOM, Holes } from "./interfaces";
import { getHtmlTemplateProperties, isHtmlTemplate, isVNode } from "./utils";
import { isComponent, ServerComponent } from "./server-component";
import { ServerProps } from "./server-props";

const voidTagNameRegexp = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;

export function renderToString(value: unknown): string {
  return stringify(1, [0, value]);
}

function stringify(
  vdom: VDOM | VDOM[],
  holes?: Holes,
  selectValue?: string
): string {
  if (Array.isArray(vdom)) {
    return vdom.reduce<string>(
      (s, v) => s + stringify(v, holes, selectValue),
      ""
    );
  }
  if (vdom == null) {
    return "";
  }
  if (typeof vdom === "number" && holes) {
    return stringify(holes[vdom], undefined, selectValue);
  }
  if (isHtmlTemplate(vdom)) {
    const p = getHtmlTemplateProperties(vdom);
    return stringify(p[0], p[1], selectValue);
  }
  if (!isVNode(vdom)) {
    return String(vdom);
  }

  const { tag, props, children } = vdom;
  const p = new ServerProps(tag, selectValue);
  if (props) {
    p.commit(props, holes);
    selectValue = p.selectValue;
  }
  let s = `<${tag}${p.getAttributeString()}>`;

  const c = isComponent(vdom) && new ServerComponent(vdom, holes);
  if (c) {
    c.connected();
    let style = c._style;
    style && (style = `<style>${c._style}</style>`);
    const shadow = renderToString(c._result);
    s += `<template shadowroot="open">${style}${shadow}</template>`;
  }
  if (p.properties.innerHTML) {
    return `${s}${p.properties.innerHTML}</${tag}>`;
  }
  if (!voidTagNameRegexp.test(tag) || c) {
    s += `${stringify(children, holes, selectValue)}</${tag}>`;
  }
  c && c.disconnected();

  return s;
}
