import { isTemplate, items, isVNode, VDOM, VProps, ArgValues } from "../html";
import { compose } from "./compose";

const voidTagNameRegexp = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;

export function stringify(
  vdom: VDOM | VDOM[],
  args?: ArgValues,
  selectValue?: string
): string {
  if (Array.isArray(vdom)) {
    return vdom.reduce<string>(
      (acc, v) => acc + stringify(v, args, selectValue),
      ""
    );
  } else if (vdom == null) {
    return "";
  } else if (typeof vdom === "number" && args) {
    return stringify(args[vdom], undefined, selectValue);
  } else if (isTemplate(vdom)) {
    const i = items(vdom);
    return stringify(i[0], i[1], selectValue);
  } else if (!isVNode(vdom)) {
    return String(vdom);
  } else {
    let s = "";

    const { tag, props, children } = compose(vdom, args);
    if (props) {
      let attrs = "";
      let html, r;
      const propsToString = (props: VProps, args?: ArgValues) => {
        for (const name in props) {
          if (name === "key" || name === "ref") continue;
          let v = props[name];
          if (typeof v === "number" && args) v = args[v];
          if (name === "...") {
            propsToString(v as VProps);
          } else if (name === "unsafe-html") {
            html = v as string;
          } else if ((r = name.match(/^(@|\.|\?)([a-zA-Z1-9-]+)/))) {
            if (r[1] === "?" && v) attrs += ` ${r[2]}`;
          } else if (v != null) {
            attrs += ` ${name}="${v}"`;
          }

          if (tag === "option" && name === "value" && v === selectValue) {
            attrs += " selected";
            selectValue = undefined;
          }
          if (tag === "select" && name === ".value" && v != null) {
            selectValue = v as string;
          }
        }
      };
      propsToString(props, args);

      s = `<${tag}${attrs}>`;
      if (html) {
        return `${s}${html}</${tag}>`;
      }
    } else {
      s = `<${tag}>`;
    }
    if (!voidTagNameRegexp.test(tag)) {
      s += `${stringify(children, args, selectValue)}</${tag}>`;
    }
    return s;
  }
}
