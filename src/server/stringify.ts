import {
  isTemplate,
  items,
  isVNode,
  VDOM,
  VProps,
  ArgValues
} from "../html/template";
import { attrPrefixRegexp, voidTagNameRegexp } from "../shared/regexp";
import { compose } from "./compose";

export function stringify(vdom: VDOM | VDOM[], args?: ArgValues): string {
  if (Array.isArray(vdom)) {
    return vdom.reduce<string>((acc, v) => acc + stringify(v, args), "");
  } else if (vdom == null) {
    return "";
  } else if (typeof vdom === "number" && args) {
    return stringify(args[vdom]);
  } else if (isTemplate(vdom)) {
    const i = items(vdom);
    return stringify(i[0], i[1]);
  } else if (!isVNode(vdom)) {
    return "" + vdom;
  } else {
    const { tag, props, children } = compose(vdom);

    let s = "";
    let r;
    const attrs = Object.assign([] as string[], { _html: "" });

    if (props) {
      const _attrs = (_props: VProps, _args?: ArgValues) => {
        for (const name of Object.keys(_props)) {
          if (name === "key" || name === "ref") continue;
          let v = _props[name];
          if (typeof v === "number" && _args) v = _args[v];
          if (name === "...") {
            _attrs(v as VProps);
          } else if (name === "unsafe-html") {
            attrs._html = v as string;
          } else if ((r = name.match(attrPrefixRegexp))) {
            if (r[1] === "?" && v) attrs.push(r[2]);
          } else if (v != null) {
            attrs.push(`${name}="${v}"`);
          }
        }
      };
      _attrs(props, args);
      (s = "") || (s = attrs.join(" "));
    }
    s = `<${tag}${s && " " + s}>`;
    if (!voidTagNameRegexp.test(tag)) {
      s += `${attrs._html || stringify(children, args)}</${tag}>`;
    }
    return s;
  }
}
