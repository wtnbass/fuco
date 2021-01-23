import { HtmlTemplate, Holes, VDOM, VText, VHole } from "./interfaces";
import {
  isVNode,
  getHoles,
  getKey,
  isHtmlTemplate,
  getHtmlTemplateProperties,
  equalsHtmlTemplate,
  isIterable,
  isText,
} from "./utils";

export type Mutation = AttributeMutation | NodeMutation;

export interface NodeMutation {
  _node: Node;
  _isSvg: boolean;
  _prev?: unknown;
}

export interface AttributeMutation {
  _node: Node;
  _name: string;
  _prev?: unknown;
}

export interface TemplateMutation extends NodeMutation {
  _mutations: ChildMutations[];
}

export type ChildMutations = NodeMutation[] & {
  _start: Node;
  _end: Node;
};

export interface TextMutation extends NodeMutation {
  _texts: Text[];
}

export function isAttributeMutation(m: Mutation): m is AttributeMutation {
  return !!(m as AttributeMutation)._name;
}

export function isTemplateMutation(m: Mutation): m is TemplateMutation {
  return !!(m as TemplateMutation)._mutations;
}

type AnyProp<T> = T & { [key: string]: unknown };

export function mount(
  vdom: VDOM | VDOM[],
  parent: Node,
  isSvg: boolean,
  mutations: Mutation[] = []
) {
  if (Array.isArray(vdom)) {
    vdom.forEach((v) => mount(v, parent, isSvg, mutations));
  } else if (!isVNode(vdom)) {
    if (typeof vdom === "number") {
      mutations[vdom] = {
        _node: parent.appendChild(document.createComment("")),
        _isSvg: isSvg,
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
      Object.keys(props).forEach((name) => {
        if (typeof props[name] === "number") {
          mutations[props[name] as VHole] = { _node: node, _name: name };
        } else {
          node.setAttribute(name, props[name] as VText);
        }
      });
    mount(children, node, isSvg, mutations);
  }
  return mutations;
}

export function commit(mutations: Mutation[], holes: Holes) {
  const q = [];
  for (let i = 1; i < mutations.length; i++) {
    const m = mutations[i];
    if (m) {
      if (isAttributeMutation(m) && m._name[0] === ".") {
        q.push(() => commitMutation(m, holes[i]));
      } else {
        commitMutation(m, holes[i]);
      }
    }
  }
  q.forEach((f) => f());
}

function commitMutation(m: Mutation, arg: unknown) {
  if (m._prev !== arg) {
    isAttributeMutation(m)
      ? commitAttribute(m._node as HTMLElement, m._name, arg, m._prev)
      : commitNode(m, arg, m._prev, 0);
    m._prev = arg;
  }
}

function commitAttribute(
  node: HTMLElement,
  name: string,
  next: unknown,
  prev?: unknown
) {
  if (name === "...") {
    if (typeof next === "object" && !Array.isArray(next) && next) {
      Object.keys(next).forEach((key) =>
        commitAttribute(
          node,
          key,
          (next as AnyProp<typeof next>)[key],
          prev && (prev as AnyProp<typeof prev>)[key]
        )
      );
    }
  } else if (name[0] === "?" && isRenderableValue(next)) {
    name = name.slice(1);
    next ? node.setAttribute(name, "") : node.removeAttribute(name);
  } else if (name[0] === ".") {
    (node as AnyProp<typeof node>)[name.slice(1)] = next;
  } else if (name[0] === "@") {
    name = name.slice(1);
    if (process.env.BUILD_ENV === "development") {
      isEventListener(next) &&
        console.warn("An event attribure must bind a function.");
    }
    isEventListener(prev) && node.removeEventListener(name, prev);
    isEventListener(next) && node.addEventListener(name, next);
  } else if (name === ":key") {
    // no render
  } else if (name === ":ref") {
    typeof next === "function"
      ? next(node)
      : ((next as AnyProp<typeof next>).current = node);
  } else if (name === ":style") {
    typeof next === "object" &&
      setStyles(
        node.style as AnyProp<typeof node.style>,
        prev as AnyProp<typeof prev>,
        next as AnyProp<typeof next>
      );
  } else if (name === ":class") {
    if (typeof next === "object") {
      const prevClassNames = classNames(prev);
      const nextClassNames = classNames(next);
      prevClassNames.forEach(
        (p) => nextClassNames.includes(p) || node.classList.remove(p)
      );
      nextClassNames.forEach(
        (n) => prevClassNames.includes(n) || node.classList.add(n)
      );
    }
  } else {
    isRenderableValue(next)
      ? node.setAttribute(name, next as string)
      : node.removeAttribute(name);
  }
}

function isRenderableValue(value: unknown) {
  return (
    value != null && typeof value !== "function" && typeof value !== "symbol"
  );
}

function isEventListener(
  value: unknown
): value is EventListenerOrEventListenerObject {
  return (
    typeof value === "function" ||
    !!(value && (value as EventListenerObject).handleEvent)
  );
}

function setStyles(
  style: AnyProp<CSSStyleDeclaration>,
  prev: Record<string, unknown>,
  next: Record<string, unknown>
) {
  for (const i in prev) if (!next || !(i in next)) style[i] = null;
  for (const i in next) if (!prev || prev[i] !== next[i]) style[i] = next[i];
}

function classNames(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return Object.keys(value as Record<string, unknown>).filter(
    (i) => !!(value as Record<string, unknown>)[i]
  );
}

function commitNode(
  mutation: NodeMutation,
  next: unknown,
  prev: unknown,
  index: number
) {
  next = isRenderableValue(next) ? next : null;
  prev = isRenderableValue(prev) ? prev : null;

  if (isIterable(next) || isIterable(prev)) {
    commitIterable(
      mutation,
      (next || []) as unknown[],
      (prev || []) as unknown[]
    );
  } else {
    const tmpl = mutation as TemplateMutation;
    const txt = mutation as TextMutation;
    if (isHtmlTemplate(prev) && !isHtmlTemplate(next)) {
      removeTemplate(tmpl._mutations[index]);
      delete tmpl._mutations[index];
    }
    if (isText(prev) && !isText(next)) {
      removeNode(txt._texts[index]);
      delete txt._texts[index];
    }
    if (isHtmlTemplate(next) && !isHtmlTemplate(prev)) {
      (tmpl._mutations = tmpl._mutations || [])[index] = insertTemplate(
        next as HtmlTemplate,
        tmpl._node,
        tmpl._isSvg
      );
    }
    if (isText(next) && !isText(prev)) {
      insertNode(
        ((txt._texts = txt._texts || [])[index] = document.createTextNode(
          next as string
        )),
        txt._node
      );
    }
    if (isHtmlTemplate(next) && isHtmlTemplate(prev)) {
      if (equalsHtmlTemplate(next, prev)) {
        commit(tmpl._mutations[index], getHoles(next));
      } else {
        removeTemplate(tmpl._mutations[index]);
        tmpl._mutations[index] = insertTemplate(next, tmpl._node, tmpl._isSvg);
      }
    }
    if (isText(next) && isText(prev)) {
      txt._texts[index].data = next as string;
    }
  }
}

function commitIterable(
  mutation: NodeMutation,
  next: unknown[],
  prev: unknown[]
) {
  next = isIterable(next) ? next : [next];
  prev = isIterable(prev) ? prev : [prev];
  if (isTemplateMutation(mutation) && getKey(next[0]) != null) {
    commitTemplatesWithKey(
      mutation,
      next as HtmlTemplate[],
      prev as HtmlTemplate[]
    );
  } else {
    for (let i = 0; i < prev.length || i < next.length; i++) {
      commitNode(mutation, next[i], prev[i], i);
    }
  }
}
function commitTemplatesWithKey(
  parentMutation: TemplateMutation,
  nexts: HtmlTemplate[],
  prevs: HtmlTemplate[]
) {
  const mutations = parentMutation._mutations;
  const nextMutations: ChildMutations[] = [];
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
          ? mutations[prevIndex]._start
          : parentMutation._node,
        parentMutation._isSvg
      );
    } else if (
      prevKeys[prevIndex] != null &&
      !nextKeys.includes(prevKeys[prevIndex])
    ) {
      removeTemplate(mutations[prevIndex++]);
    } else {
      commit(
        (nextMutations[nextIndex++] = mutations[prevIndex++]),
        getHoles(next)
      );
    }
  }
  parentMutation._mutations = nextMutations;
}

function insertTemplate(
  template: HtmlTemplate,
  refNode: Node,
  isSvg: boolean
): ChildMutations {
  const [vdom, holes] = getHtmlTemplateProperties(template);
  const fragment = document.createDocumentFragment();
  const mutations: any = [];
  mutations._start = document.createComment("");
  mutations._end = document.createComment("");

  mount(vdom, fragment, isSvg, mutations);
  commit(mutations, holes);
  insertNode(mutations._start, refNode);
  insertNode(fragment, refNode);
  insertNode(mutations._end, refNode);
  return mutations;
}

function removeTemplate(mutations: ChildMutations) {
  let start = mutations._start;
  while (start !== mutations._end) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const next = start.nextSibling!;
    removeNode(start);
    start = next;
  }
  removeNode(mutations._end);
}

function insertNode(newNode: Node, refNode: Node) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  refNode.parentNode!.insertBefore(newNode, refNode);
}

function removeNode(node: Node) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  node.parentNode!.removeChild(node);
}
