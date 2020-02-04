import { __def__ } from "../fuco";
import { VNode, VDOM, isVNode, ArgValues, isTemplate, items } from "../html";
import { DummyComponent } from "./component";

export function compose(vnode: VNode, args: ArgValues | undefined): VNode {
  let fc;
  if (!(fc = __def__[vnode.tag])) {
    return vnode;
  }
  const { tag, props, children } = vnode;
  const c = new DummyComponent(fc, props, args);
  props && delete props[".innerHTML"];
  const shadowroot = {
    tag: "shadowroot",
    children: replaceSlot(1, [, c.result], children) as VDOM[]
  };
  return { tag, props, children: [shadowroot] };
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
      const [slots, namedSlots] = getSlotChildren(slottedNodes);
      if (vdom.props && vdom.props.name) {
        vdom.children = namedSlots[vdom.props.name as string];
      } else {
        vdom.children = slots;
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

function getSlotChildren(slotted: VDOM[]) {
  const slots: VDOM[] = [];
  const namedSlots: { [name: string]: VDOM[] } = {};
  for (let i = 0; i < slotted.length; i++) {
    const s = slotted[i];
    let slotName: string;
    if (isVNode(s) && s.props && (slotName = s.props.slot as string)) {
      if (typeof namedSlots[slotName] === "undefined") {
        namedSlots[slotName] = [];
      }
      namedSlots[slotName].push(s);
    } else {
      slots.push(s);
    }
  }
  return [slots, namedSlots] as const;
}
