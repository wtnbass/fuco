import { __FucoRegistry__ } from "../fuco";
import {
  VNode,
  VDOM,
  isVNode,
  ArgValues,
  VProps,
  isTemplate,
  items
} from "../html";
import { Component, CmpProps } from "./component";

export function compose(vnode: VNode, args: ArgValues | undefined): VNode {
  let fc;
  if (!(fc = __FucoRegistry__[vnode.tag])) {
    return vnode;
  }
  const c = new Component(fc, createCmpProps(vnode.props, args));
  const children = replaceSlot(1, [, c.result], vnode.children);
  const template = {
    tag: "template",
    props: { "shadow-root": "" },
    children: Array.isArray(children) ? children : [children]
  };
  return { ...vnode, children: [template] };
}

function createCmpProps(
  props: VProps | undefined,
  args: ArgValues | undefined
) {
  const cmpProps: CmpProps = {};
  if (props) {
    const resolveArgs = (_props: VProps) => {
      for (const key in _props) {
        if (key === "...") {
          resolveArgs(_props[key] as VProps);
        } else {
          const value = _props[key];
          if (typeof value === "number" && args) {
            cmpProps[key] = args[value];
          } else {
            cmpProps[key] = value as string;
          }
        }
      }
    };
    resolveArgs(props);
  }
  return cmpProps;
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
