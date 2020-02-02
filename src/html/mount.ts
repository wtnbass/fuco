import { isVNode, VDOM, VText, VArg } from "./template";
import { Mutation } from "./mutations";

export function mount(
  vdom: VDOM | VDOM[],
  parent: Node,
  isSvg: boolean,
  mutations: Mutation[] = []
) {
  if (Array.isArray(vdom)) {
    vdom.forEach(v => mount(v, parent, isSvg, mutations));
  } else if (!isVNode(vdom)) {
    if (typeof vdom === "number") {
      mutations[vdom] = {
        _node: parent.appendChild(document.createComment("")),
        _isSvg: isSvg
      };
    } else {
      parent.appendChild(document.createTextNode(vdom as VText));
    }
  } else {
    const { tag, props, children } = vdom;
    isSvg = tag === "svg" || isSvg;
    const node = parent.appendChild(
      isSvg
        ? document.createElementNS("http://www.w3.org/2000/svg", tag)
        : document.createElement(tag)
    );
    props &&
      Object.keys(props).forEach(name => {
        if (typeof props[name] === "number") {
          mutations[props[name] as VArg] = { _node: node, _name: name };
        } else {
          node.setAttribute(name, props[name] as VText);
        }
      });
    mount(children, node, isSvg, mutations);
  }
  return mutations;
}
