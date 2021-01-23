import { VDOM, VNode } from "./interfaces";

const openTagRegexp = /^\s*<\s*([a-z1-9-]+)/i;
const closeTagRegexp = /^<\s*\/\s*([a-z1-9-]+)>\s*/i;
const tagEndRegexp = /^\s*(\/)?>\s*/;
const voidTagNameRegexp = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
const attributeNameRegexp = /^\s*([^\s"'<>\/=]+)(?:\s*(=))?/;
const attributeValueRegexp = /^\s*(?:\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const doctypeRegexp = /^\s*<!DOCTYPE [^>]+>/i;
const commentStartRegexp = /^\s*<!--/;
const commentEndRegexp = /.*-->\s*/;

export function parse(htmls: readonly string[]) {
  const root: { children: VDOM[] } = { children: [] };
  const stack: VNode[] = [root as VNode];
  let curr = 0;
  let inTag = false;
  let inComment = false;
  let attrName = "";

  function commit(value: string | number) {
    if (inComment) return;
    /* istanbul ignore else */
    if (inTag && attrName) {
      (stack[curr].props || (stack[curr].props = {}))[attrName] = value;
      attrName = "";
    } else if (!inTag && value) {
      stack[curr].children.push(value);
    }
  }

  for (let i = 0; i < htmls.length; i++) {
    if (i) commit(i);
    let html = htmls[i];
    let last;
    let r;
    while (html) {
      /* istanbul ignore next */
      if (last === html) throw new Error("parse error");
      last = html;
      if (inComment) {
        if ((r = html.match(commentEndRegexp))) inComment = false;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        html = html.slice((inComment ? html : r![0]).length);
      } else if (inTag) {
        /* istanbul ignore else */
        if ((r = html.match(tagEndRegexp))) {
          html = html.slice(r[0].length);
          if (r[1] || voidTagNameRegexp.test(stack[curr].tag))
            stack.length = curr--;
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
          html = html.slice(r[0].length - 2);
          inComment = true;
        } else if ((r = html.match(closeTagRegexp))) {
          html = html.slice(r[0].length);
          while (curr > 0 && stack[curr].tag !== r[1].toLowerCase())
            stack.length = curr--;
          if (curr) stack.length = curr--;
        } else if ((r = html.match(openTagRegexp))) {
          html = html.slice(r[0].length);
          curr = stack.push({ tag: r[1].toLowerCase(), children: [] }) - 1;
          stack[curr - 1].children.push(stack[curr]);
          inTag = true;
        } else {
          r = html.indexOf("<") || html.indexOf("<", 1);
          html = html.slice((r = html.slice(0, ~r ? r : html.length)).length);
          commit(r.replace(/^\s*\n\s*|\s*\n\s*$/g, ""));
        }
      }
    }
  }
  return root.children;
}
