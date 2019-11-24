/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-use-before-define */

import {
  isTemplate,
  isTemplateHavingKey,
  isVNode,
  items,
  getKey,
  getArgs,
  equalsTemplate,
  HtmlTemplate,
  VDOM,
  VText,
  VArg,
  ArgValues
} from "./template";
import { attrPrefixRegexp } from "../shared/regexp";

type Mutations = Mutation[] & { _marks?: [Node, Node] };

type Mutation = {
  node: Node;
  name?: string;
  prev?: unknown;
  _mutations?: Mutations[];
  _texts?: Text[];
};

export function mount(vdom: VDOM | VDOM[], parent: Node, mutations: Mutations) {
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

export function resolve(mutations: Mutations, args: ArgValues) {
  mutations.forEach((m, i) => {
    if (m.prev !== args[i]) {
      m.name
        ? resolveAttribute(m.node as Element, m.name, args[i], m.prev)
        : resolveNode(m, args[i], m.prev, 0);
      m.prev = args[i];
    }
  });
}

function resolveAttribute(node: Element, name: string, next: any, prev?: any) {
  const r = name.match(attrPrefixRegexp);
  if (r) {
    /* istanbul ignore else */
    if (r[1] === "?") {
      next ? node.setAttribute(r[2], "") : node.removeAttribute(r[2]);
    } else if (r[1] === ".") {
      (node as Element & { [name: string]: unknown })[r[2]] = next;
    } else if (r[1] === "@") {
      prev && node.removeEventListener(r[2], prev as any);
      node.addEventListener(r[2], next as any);
    }
  } else if (name === "...") {
    Object.keys(next).forEach(key =>
      resolveAttribute(node, key, next[key], prev && prev[key])
    );
  } else if (name === "ref") {
    typeof next === "function" ? next(node) : (next.current = node);
  } else if (name === "unsafe-html") {
    node.innerHTML = next;
  } else {
    next != null && node.setAttribute(name, next);
  }
}

function resolveNode(mutation: Mutation, next: any, prev: any, index: number) {
  const base = next != null ? next : prev;
  if (base == null) return;
  if (Array.isArray(base)) {
    prev = prev || [];
    if (mutation._mutations && isTemplateHavingKey(base[0])) {
      resolveTemplatesWithKey(mutation, next, prev);
    } else {
      for (let i = 0; i < prev.length || i < next.length; i++) {
        resolveNode(mutation, next[i], prev[i], i);
      }
    }
  } else if (prev && next && !isTemplate(prev) && isTemplate(next)) {
    resolveText(mutation, null, prev, index);
    resolveTemplate(mutation, next, null, index);
  } else if (prev && next && isTemplate(prev) && !isTemplate(next)) {
    resolveTemplate(mutation, null, prev, index);
    resolveText(mutation, next, null, index);
  } else if (isTemplate(base)) {
    resolveTemplate(mutation, next, prev, index);
  } else {
    resolveText(mutation, next, prev, index);
  }
}

function resolveTemplatesWithKey(
  parentMutation: Mutation,
  nexts: HtmlTemplate[],
  prevs: HtmlTemplate[]
) {
  const mutations = parentMutation._mutations!;
  const nextMutations: Mutations[] = [];
  const nextKeys = nexts.map(getKey);
  const prevKeys = prevs.map(getKey);
  let prevIndex = 0;
  let nextIndex = 0;
  while (prevIndex < prevKeys.length || nextIndex < nextKeys.length) {
    const next = nexts[nextIndex];

    if (
      nextKeys[nextIndex] != null &&
      !prevKeys.includes(nextKeys[nextIndex])
    ) {
      nextMutations[nextIndex++] = insertTemplate(
        next,
        mutations[prevIndex]
          ? (mutations[prevIndex] as Mutations)._marks![0]
          : parentMutation.node
      );
    } else if (
      prevKeys[prevIndex] != null &&
      !nextKeys.includes(prevKeys[prevIndex])
    ) {
      removeTemplate(mutations[prevIndex++]);
    } else {
      resolve(
        (nextMutations[nextIndex++] = mutations[prevIndex++]),
        getArgs(next)
      );
    }
  }
  parentMutation._mutations = nextMutations;
}

function resolveTemplate(
  m: Mutation,
  next: HtmlTemplate | undefined | null,
  prev: HtmlTemplate | undefined | null,
  index: number
) {
  if (!prev) {
    (m._mutations = m._mutations || [])[index] = insertTemplate(next!, m.node);
  } else if (!next) {
    removeTemplate(m._mutations![index]);
    delete m._mutations![index];
  } else if (equalsTemplate(next, prev)) {
    resolve(m._mutations![index], getArgs(next));
  } else {
    removeTemplate(m._mutations![index]);
    m._mutations![index] = insertTemplate(next, m.node);
  }
}

function resolveText(
  m: Mutation,
  next: VText | undefined | null,
  prev: VText | undefined | null,
  index: number
) {
  if (prev == null) {
    insertNode(
      ((m._texts = m._texts || [])[index] = document.createTextNode(
        next as string
      )),
      m.node
    );
  } else if (next == null) {
    m._texts![index].parentNode!.removeChild(m._texts![index]);
    delete m._texts![index];
  } else if (next !== prev) {
    m._texts![index].data = next;
  }
}

function insertTemplate(template: HtmlTemplate, refNode: Node): Mutations {
  const [vdom, args] = items(template);
  const fragment = document.createDocumentFragment();
  const mutations: Mutations = [];
  mutations._marks = [document.createComment(""), document.createComment("")];
  mount(vdom, fragment, mutations);
  resolve(mutations, args);
  insertNode(mutations._marks[0], refNode);
  insertNode(fragment, refNode);
  insertNode(mutations._marks[1], refNode);
  return mutations;
}

function removeTemplate(mutations: Mutations) {
  // eslint-disable-next-line prefer-const
  let [start, end] = mutations._marks!;
  while (start !== end) {
    const next = start.nextSibling!;
    end.parentNode!.removeChild(start);
    start = next;
  }
  end.parentNode!.removeChild(end);
}

function insertNode(newNode: Node, refNode: Node) {
  refNode.parentNode!.insertBefore(newNode, refNode);
}
