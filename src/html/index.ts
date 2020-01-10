/* eslint-disable prefer-rest-params */

import { parse } from "./parse";
import { mount } from "./mount";
import { commit } from "./commit";
import { createTemplate, HtmlTemplate } from "./template";

const Cache = new WeakMap();

export function html(
  strings: TemplateStringsArray,
  ..._: unknown[]
): HtmlTemplate {
  let vdom = Cache.get(strings);
  vdom || Cache.set(strings, (vdom = parse(strings.raw)));
  let key = vdom[0] && vdom[0].props && vdom[0].props.key;
  if (typeof key === "number") key = arguments[key];

  return createTemplate(vdom, arguments, key);
}

export function render(template: unknown, container: Node) {
  const [vdom, args] = [1, [, template]];
  let mutations = Cache.get(container);
  if (!mutations) {
    mount(vdom, container, (mutations = []));
    Cache.set(container, mutations);
  }
  commit(mutations, args);
}
