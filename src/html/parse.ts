/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { VDOM, VNode, VPropValue } from "./template";
const openTagRegexp = /^\s*<\s*([a-z1-9-]+)/i;
const closeTagRegexp = /^<\s*\/\s*([a-z1-9-]+)>/i;
const tagEndRegexp = /^\s*(\/)?>/;
const voidTagNameRegexp = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
const attributeNameRegexp = /^\s*([^\s"'<>\/=]+)(?:\s*(=))?/;
const attributeValueRegexp = /^\s*(?:\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const doctypeRegexp = /^\s*<!DOCTYPE [^>]+>/i;
const commentStartRegexp = /^\s*<!--/;
const commentEndRegexp = /-->/;

interface VRoot {
  children: VDOM[];
}
export function parse(htmls: readonly string[]) {
  const root: VRoot = { children: [] };
  const stack: VNode[] = [];
  let inTag = false;
  let inComment = false;
  let current: VNode = root as VNode;
  let attrName = "";

  function commit(value: VDOM) {
    if (inComment) return;
    /* istanbul ignore else */
    if (inTag && attrName) {
      (current.props || (current.props = {}))[attrName] = value as VPropValue;
      attrName = "";
    } else if (!inTag) {
      value && current.children.push(value as VDOM);
    }
  }

  for (let i = 0; i < htmls.length; i++) {
    if (i) commit(i);
    let html = htmls[i];
    let last;
    let r;
    while (html) {
      /* istanbul ignore next */
      if (last === html) throw new Error("parse error:\n\t" + last);
      last = html;
      if (inComment) {
        if ((r = ~html.search(commentEndRegexp))) inComment = false;
        html = html.slice(r ? ~r + 3 : html.length);
      } else if (inTag) {
        /* istanbul ignore else */
        if ((r = html.match(tagEndRegexp))) {
          html = html.slice(r[0].length);
          if (r[1] || voidTagNameRegexp.test(current.tag)) {
            current = stack.pop()!;
          }
          inTag = false;
        } else if (attrName && (r = html.match(attributeValueRegexp))) {
          html = html.slice(r[0].length);
          commit(r[1] || r[2] || r[3] || "");
        } else if ((r = html.match(attributeNameRegexp))) {
          html = html.slice(r[0].length).trim();
          attrName = r[1];
          if (r[1] !== "..." && !r[2]) commit("");
        }
      } else {
        if ((r = html.match(doctypeRegexp))) {
          html = html.slice(r[0].length);
        } else if ((r = html.match(commentStartRegexp))) {
          html = html.slice(2);
          inComment = true;
        } else if ((r = html.match(closeTagRegexp))) {
          html = html.slice(r[0].length);
          const t = r[1].toLowerCase();
          if (current.tag !== t) {
            let j = stack.length;
            while (j > 0 && stack[j - 1].tag !== t) j--;
            if (j) {
              stack.length = j - 1;
              current = stack.pop()!;
            }
          } else {
            current = stack.pop()!;
          }
        } else if ((r = html.match(openTagRegexp))) {
          html = html.slice(r[0].length);

          stack.push(current);
          current.children.push(
            (current = { tag: r[1].toLowerCase(), children: [] })
          );
          inTag = true;
        } else {
          r = html.indexOf("<") || html.indexOf("<", 1);
          const text = html.slice(0, ~r ? r : html.length);
          html = html.slice(text.length);
          commit(text.replace(/^\s*\n\s*|\s*\n\s*$/g, ""));
        }
      }
    }
  }
  return root.children;
}
