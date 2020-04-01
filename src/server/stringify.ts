import { isTemplate, items, isVNode, VDOM, ArgValues } from "../html";
import {
  ServerComponent,
  isComponent,
  deleteContext,
  setContext
} from "./component";
import { PropsManager } from "./props";

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
      setContext(c);
    }

    let s;
    const { tag, props, children } = vdom;
    const p = new PropsManager(tag, selectValue);
    if (props) {
      p.commit(props, args);
      selectValue = p.selectValue;
    }
    s = `<${tag}${p.getAttributeString()}>`;
    if (p.properties.innerHTML) {
      return `${s}${p.properties.innerHTML}</${tag}>`;
    }
    if (!voidTagNameRegexp.test(tag)) {
      s += `${stringify(children, args, selectValue)}</${tag}>`;
    }
    c && deleteContext(c);

    return s;
  }
}
