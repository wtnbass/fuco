import { parse } from "./parse";
import { mount, commit } from "./mutation";
import { HtmlTemplate, VDOM, VNode } from "./interfaces";

import "./global";

const Cache = new WeakMap();

export function html(
  strings: TemplateStringsArray,
  ..._: unknown[]
): HtmlTemplate {
  let vdom: VDOM[] = Cache.get(strings);
  vdom || Cache.set(strings, (vdom = parse(strings.raw)));
  let key = vdom[0] && (vdom[0] as VNode).props?.[":key"];
  if (typeof key === "number") key = arguments[key];
  return { [$fucoGlobal.__HtmlTemplate]: [vdom, arguments, key] };
}

export function render(value: unknown, container: Node) {
  let mutations = Cache.get(container);
  mutations ||
    Cache.set(
      container,
      (mutations = mount(1, container, /svg/i.test(container.nodeName)))
    );
  commit(mutations, [, value]);
}
