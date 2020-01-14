import { __FucoRegistry__ } from "../fuco";
import { VNode, VDOM, isVNode, ArgValues, isTemplate, items } from "../html";
import { Component } from "./component";

export function compose(vnode: VNode, args: ArgValues | undefined): VNode {
  let fc;
  if (!(fc = __FucoRegistry__[vnode.tag])) {
    return vnode;
  }
  const { tag, props, children } = vnode;
  const c = new Component(fc, props, args);
  props && delete props[".innerHTML"];
  const template = {
    tag: "template",
    props: { "shadow-root": "" },
    children: replaceSlot(1, [, c.result], children) as VDOM[]
  };
  return { tag, props, children: [template] };
}

function replaceSlot(
  vdom: VDOM[] | VDOM,
  args: ArgValues,
  slottedNodes: VDOM[],
  hasNamedSlot = false
): VDOM[] | VDOM {
  if (Array.isArray(vdom)) {
    return vdom.map(
      v => replaceSlot(v, args, slottedNodes, hasNamedSlot) as VDOM
    );
  } else if (typeof vdom === "number") {
    return replaceSlot(args[vdom], args, slottedNodes, hasNamedSlot);
  } else if (isTemplate(vdom)) {
    const [v, a] = items(vdom);
    return replaceSlot(v, a, slottedNodes, hasNamedSlot);
  } else if (isVNode(vdom)) {
    if (vdom.tag === "slot") {
      if (vdom.props && vdom.props.name) {
        hasNamedSlot = true;
        vdom.children = findNamedSlot(slottedNodes, vdom.props.name as string);
      } else if (!hasNamedSlot) {
        vdom.children = slottedNodes;
      }
    } else {
      vdom.children = vdom.children.map(
        v => replaceSlot(v, args, slottedNodes, hasNamedSlot) as VDOM
      );
    }
    return vdom;
  } else {
    return vdom;
  }
}

function findNamedSlot(slotted: VDOM[], slotName: string): VDOM[] {
  for (let i = 0; i < slotted.length; i++) {
    const s = slotted[i];
    if (!isVNode(s)) continue;
    if (s.props && s.props.slot && s.props.slot === slotName) {
      return [s];
    }
    findNamedSlot(s.children, slotName);
  }
  return [];
}
