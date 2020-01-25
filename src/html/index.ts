import { parse } from "./parse";
import { mount } from "./mount";
import { commit } from "./commit";
import { createTemplate, HtmlTemplate, VDOM } from "./template";

export {
  HtmlTemplate,
  VDOM,
  VNode,
  VProps,
  VPropValue,
  VText,
  VArg,
  ArgValues,
  items,
  isTemplate,
  isVNode
} from "./template";

const Cache = new WeakMap();

export function html(
  strings: TemplateStringsArray,
  ..._: unknown[]
): HtmlTemplate {
  let vdom: VDOM[] = Cache.get(strings);
  vdom || Cache.set(strings, (vdom = parse(strings.raw)));
  /* eslint-disable-next-line prefer-rest-params */
  return createTemplate(vdom, arguments);
}

export function render(template: unknown, container: Node) {
  let mutations = Cache.get(container);
  mutations ||
    Cache.set(
      container,
      (mutations = mount(
        1,
        container,
        container.nodeName.toLowerCase() === "svg"
      ))
    );
  commit(mutations, [, template]);
}
