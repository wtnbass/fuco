/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { VDOM, VNode, VPropValue } from "./template";
import {
  openTagRegexp,
  closeTagRegexp,
  tagEndRegexp,
  voidTagNameRegexp,
  attrNameRegexp,
  quotedAttrValueRegexp,
  rawAttrValueRegexp,
  doctypeRegexp,
  commentStartRegexp,
  commentEndRegexp,
  spreadAttrRegexp
} from "../shared/regexp";

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
        } else if (attrName && (r = html.match(quotedAttrValueRegexp))) {
          html = html.slice(r[0].length);
          commit(r[2]);
        } else if (attrName && (r = html.match(rawAttrValueRegexp))) {
          const p = r[0].indexOf(">");
          html = html.slice(~p ? p : r[0].length);
          commit(r[1]);
        } else if (
          ((r = html.match(spreadAttrRegexp)) && i < htmls.length - 1) ||
          (r = html.match(attrNameRegexp))
        ) {
          html = html.slice(r[0].length);
          attrName = r[1];
        }
      } else {
        if ((r = html.match(doctypeRegexp))) {
          html = html.slice(r[0].length);
        } else if ((r = html.match(commentStartRegexp))) {
          html = html.slice(2);
          inComment = true;
        } else if ((r = html.match(closeTagRegexp))) {
          html = html.slice(r[0].length);
          if (current.tag !== r[1]) {
            let j = stack.length;
            while (j > 0 && stack[j - 1].tag !== r[1]) j--;
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
          current.children.push((current = { tag: r[1], children: [] }));
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
