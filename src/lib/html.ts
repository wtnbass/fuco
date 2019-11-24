/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any, prefer-rest-params */
const openTagRegexp = /^\s*<\s*([a-zA-Z1-9-]+)/;
const closeTagRegexp = /^\s*<\s*\/\s*([a-zA-Z1-9-]+)>/;
const tagEndRegexp = /^\s*(\/)?>/;
const voidTagNameRegexp = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
const attrNameRegexp = /\s*([.?@a-zA-Z1-9-]+)\s*=/;
const quotedAttrValueRegexp = /\s*(["'])((?:.)*?)\1/;
const rawAttrValueRegexp = /\s*(.+?)[\s>]/;
const doctypeRegexp = /^\s*<!DOCTYPE [^>]+>/i;
const commentStartRegexp = /^\s*<!--/;
const commentEndRegexp = /-->/;
const attrPrefixRegexp = /^(@|\.|\?)([a-zA-Z1-9-]+)/;
const spreadAttrRegexp = /\s*(\.{3})\s*$/;

const Template = Symbol();

const Cache = new WeakMap();

export type HtmlTemplate = {
  [Template]: [VDOM, ArgValues, Key?];
};

type VDOM = VNode | VText | VArg;

type VNode = {
  tag?: string;
  props?: { [name: string]: VPropValue };
  children: VDOM[];
};

type VPropValue = VText | VArg;

type VText = string;

type VArg = number;

type ArgValues = IArguments | Array<unknown>;

type Key = unknown;

type Mutations = Mutation[] & { _marks?: [Node, Node] };

type Mutation = {
  node: Node;
  name?: string;
  prev?: unknown;
  _mutations?: Mutations[];
  _texts?: Text[];
};

export function html(
  strings: TemplateStringsArray,
  ..._: unknown[]
): HtmlTemplate {
  let vdom = Cache.get(strings);
  vdom || Cache.set(strings, (vdom = parse(strings.raw)));
  let key = vdom[0] && vdom[0].props && vdom[0].props.key;
  if (typeof key === "number") key = arguments[key];

  return { [Template]: [vdom, arguments, key] };
}

export function render(template: unknown, container: Node) {
  const [vdom, args] = [1, [0, template]];
  let mutations = Cache.get(container);
  if (!mutations) {
    walk(vdom, container, (mutations = []));
    Cache.set(container, mutations);
  }
  resolve(mutations, args);
}

function parse(htmls: readonly string[]) {
  const root: VDOM = { children: [] };
  const stack: VNode[] = [];
  let inTag = false;
  let inComment = false;
  let current: VNode = root;
  let attrName = "";

  function commit(value: VDOM) {
    if (inComment) return;
    /* istanbul ignore else */
    if (inTag && attrName) {
      (current.props || (current.props = {}))[attrName] = value as VPropValue;
      attrName = "";
    } else if (!inTag) {
      value && current.children.push(value as VDOM);
    }
  }

  for (let i = 0; i < htmls.length; i++) {
    if (i) commit(i);
    let html = htmls[i];
    let last;
    let r;
    while (html) {
      /* istanbul ignore next */
      if (last === html) throw new Error("parse error:\n\t" + last);
      last = html;
      if (inComment) {
        if ((r = ~html.search(commentEndRegexp))) inComment = false;
        html = html.slice(r ? ~r + 3 : html.length);
      } else if (inTag) {
        /* istanbul ignore else */
        if ((r = html.match(tagEndRegexp))) {
          html = html.slice(r[0].length);
          if (r[1] || voidTagNameRegexp.test(current.tag!)) {
            current = stack.pop()!;
          }
          inTag = false;
        } else if (attrName && (r = html.match(quotedAttrValueRegexp))) {
          html = html.slice(r[0].length);
          commit(r[2]);
        } else if (attrName && (r = html.match(rawAttrValueRegexp))) {
          const p = r[0].indexOf(">");
          html = html.slice(~p ? p : r[0].length);
          commit(r[1]);
        } else if (
          ((r = html.match(spreadAttrRegexp)) && i < htmls.length - 1) ||
          (r = html.match(attrNameRegexp))
        ) {
          html = html.slice(r[0].length);
          attrName = r[1];
        }
      } else {
        if ((r = html.match(doctypeRegexp))) {
          html = html.slice(r[0].length);
        } else if ((r = html.match(commentStartRegexp))) {
          html = html.slice(2);
          inComment = true;
        } else if ((r = html.match(closeTagRegexp))) {
          html = html.slice(r[0].length);
          if (current.tag !== r[1]) {
            let j = stack.length;
            while (j > 0 && stack[j - 1].tag !== r[1]) j--;
            if (j) {
              stack.length = j - 1;
              current = stack.pop()!;
            }
          } else {
            current = stack.pop()!;
          }
        } else if ((r = html.match(openTagRegexp))) {
          html = html.slice(r[0].length);

          stack.push(current);
          current.children.push((current = { tag: r[1], children: [] }));
          inTag = true;
        } else {
          r = html.indexOf("<") || html.indexOf("<", 1);
          const text = html.slice(0, ~r ? r : html.length);
          html = html.slice(text.length);
          commit(text.replace(/^\s*\n\s*|\s*\n\s*$/g, ""));
        }
      }
    }
  }
  return root.children;
}

function walk(vdom: VDOM[] | VDOM, parent: Node, mutations: Mutations) {
  if (Array.isArray(vdom)) {
    vdom.forEach(v => walk(v, parent, mutations));
  } else if (!(vdom as VNode).tag) {
    if (typeof vdom === "number") {
      mutations[vdom] = {
        node: parent.appendChild(document.createComment(""))
      };
    } else {
      parent.appendChild(document.createTextNode(vdom as VText));
    }
  } else {
    const { tag, props, children } = vdom as VNode;
    const node = parent.appendChild(document.createElement(tag!));
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
      walk(children, node, mutations);
    }
  }
}

function resolve(mutations: Mutations, args: ArgValues) {
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
    if (mutation._mutations && base[0][Template][2] != null) {
      resolveTemplatesWithKey(mutation, next, prev);
    } else {
      for (let i = 0; i < prev.length || i < next.length; i++) {
        resolveNode(mutation, next[i], prev[i], i);
      }
    }
  } else if (prev && next && !prev[Template] && next[Template]) {
    resolveText(mutation, null, prev, index);
    resolveTemplate(mutation, next, null, index);
  } else if (prev && next && prev[Template] && !next[Template]) {
    resolveTemplate(mutation, null, prev, index);
    resolveText(mutation, next, null, index);
  } else if (base[Template]) {
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
  const nextKeys = nexts.map(t => t[Template][2]);
  const prevKeys = prevs.map(t => t[Template][2]);
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
        next[Template][1]
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
  } else if (next[Template][1][0] === prev[Template][1][0]) {
    resolve(m._mutations![index], next[Template][1]);
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
  const [vdom, args] = template[Template];
  const fragment = document.createDocumentFragment();
  const mutations: Mutations = [];
  mutations._marks = [document.createComment(""), document.createComment("")];
  walk(vdom, fragment, mutations);
  resolve(mutations, args);
  insertNode(mutations._marks![0], refNode);
  insertNode(fragment, refNode);
  insertNode(mutations._marks![1], refNode);
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
