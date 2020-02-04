import { isTemplate, items, isVNode, VDOM, VProps, ArgValues } from "../html";
import {
  ServerComponent,
  isComponent,
  deleteContext,
  setContext
} from "./component";

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
    let c;
    if (isComponent(vdom)) {
      c = new ServerComponent(vdom, args);
      vdom = c.getComposedVDOM();
    }
    c && setContext(c);

    let s;
    const { tag, props, children } = vdom;
    if (props) {
      let attrs = "";
      let html;
      const propsToString = (props: VProps, args?: ArgValues) => {
        for (const name in props) {
          let v = props[name] as unknown;
          if (typeof v === "number" && args) v = args[v];
          if (name === "...") {
            propsToString(v as VProps);
          } else if (/^[.?@:]/.test(name)) {
            if (name[0] === "?" && v) attrs += ` ${name.slice(1)}`;
            else if (name === ".innerHTML") html = v as string;
            else if (name === ":class" && typeof v === "object" && v != null) {
              if (!Array.isArray(v))
                v = Object.keys(v).filter(
                  i => (v as { [i: string]: unknown })[i]
                );
              attrs += ` class="${(v as unknown[]).join(" ")}"`;
            } else if (
              name === ":style" &&
              typeof v === "object" &&
              v != null
            ) {
              v = Object.keys(v)
                .map(
                  i =>
                    `${i.replace(/[A-Z]/g, c => "-" + c.toLowerCase())}: ${
                      (v as { [i: string]: unknown })[i]
                    };`
                )
                .join(" ");
              attrs += ` style="${v}"`;
            }
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
    c && deleteContext(c);

    return s;
  }
}
