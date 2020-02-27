import { isTemplate, items, isVNode, VDOM, ArgValues } from "../html";
import {
  ServerComponent,
  isComponent,
  deleteContext,
  setContext
} from "./component";
import { createParent, propsToParent } from "./props";

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
      const parent = createParent(tag, selectValue);
      propsToParent(parent, props, args);
      selectValue = parent.selectValue;

      const attrs = Object.entries(parent.attributes).reduce<string>(
        (acc, [name, value]) => {
          const attr = value === "" ? name : `${name}="${value}"`;
          return `${acc} ${attr}`;
        },
        ""
      );

      s = `<${tag}${attrs}>`;
      if (parent.properties.innerHTML) {
        return `${s}${parent.properties.innerHTML}</${tag}>`;
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
