import { isVNode, VDOM, VText, VArg } from "./template";
import { Mutation } from "./mutations";

export function mount(
  vdom: VDOM | VDOM[],
  parent: Node,
  mutations: Mutation[]
) {
  if (Array.isArray(vdom)) {
    vdom.forEach(v => mount(v, parent, mutations));
  } else if (!isVNode(vdom)) {
    if (typeof vdom === "number") {
      mutations[vdom] = {
        node: parent.appendChild(document.createComment(""))
      };
    } else {
      parent.appendChild(document.createTextNode(vdom as VText));
    }
  } else {
    const { tag, props, children } = vdom;
    const node = parent.appendChild(document.createElement(tag));
    props &&
      Object.keys(props).forEach(name => {
        if (name === "key") return;
        if (typeof props[name] === "number") {
          mutations[props[name] as VArg] = { node, name };
        } else {
          node.setAttribute(name, props[name] as VText);
        }
      });
    if (!props || !props["unsafe-html"]) {
      mount(children, node, mutations);
    }
  }
}
