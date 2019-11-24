import { VNode, VDOM, isVNode } from "../html/template";
import { functionalComponents, FunctionalComponent } from "../core/component";

function makeShadowRootTemplate(fc: FunctionalComponent): VNode {
  // TODO: hooks
  const result = fc() as VDOM | VDOM[];
  return {
    tag: "template",
    props: { "shadow-root": "" },
    children: Array.isArray(result) ? result : [result]
  };
}

function replaceSlot(vdom: VDOM[], slottedNodes: VDOM[]): VDOM[] {
  let hasNamedSlot = false;

  const findNamedSlot = (slotted: VDOM[], slotName: string) => {
    for (let i = 0; i < slotted.length; i++) {
      const s = slotted[i];
      if (!isVNode(s)) continue;
      if (s.props && s.props.slot && s.props.slot !== slotName) {
        delete slotted[i];
        return s;
      }
      findNamedSlot(s.children, slotName);
    }
    return null;
  };

  const replace = (vs: VDOM[]) => {
    for (const v of vs) {
      if (!isVNode(v) || v.tag !== "slot") continue;
      if (v.props && v.props.name) {
        hasNamedSlot = true;
        findNamedSlot(slottedNodes, v.props.name as string);
      } else if (!hasNamedSlot) {
        v.children = slottedNodes;
        break;
      }
      replace(v.children);
    }
  };

  replace(vdom);

  return vdom;
}

export function compose(vnode: VNode): VNode {
  let fc;
  if (!(fc = functionalComponents[vnode.tag])) {
    return vnode;
  }
  const { tag, props, children: slotted } = vnode;
  const children = replaceSlot([makeShadowRootTemplate(fc)], slotted);
  return { tag, props, children };
}
