import {
  isTemplate,
  isTemplateHavingKey,
  items,
  getKey,
  getArgs,
  equalsTemplate,
  HtmlTemplate,
  VText,
  ArgValues
} from "./template";
import { mount } from "./mount";
import {
  isAttributeMutation,
  Mutation,
  NodeMutation,
  isTemplateMutation,
  TemplateMutation,
  TextMutation,
  ChildMutations
} from "./mutations";

export function commit(mutations: Mutation[], args: ArgValues) {
  const q = [];
  for (let i = 1; i < mutations.length; i++) {
    const m = mutations[i];
    if (m) {
      if (isAttributeMutation(m) && m.name[0] === ".") {
        q.push(() => commitMutation(m, args[i]));
      } else {
        commitMutation(m, args[i]);
      }
    }
  }
  q.forEach(f => f());
}

function commitMutation(m: Mutation, arg: unknown) {
  if (m.prev !== arg) {
    isAttributeMutation(m)
      ? commitAttribute(m.node as Element, m.name, arg, m.prev)
      : commitNode(m, arg, m.prev, 0);
    m.prev = arg;
  }
}

type ChProp<T> = T & { [key: string]: unknown };

function commitAttribute(
  node: Element,
  name: string,
  next: unknown,
  prev?: unknown
) {
  const r = name.match(/^(@|\.|\?)([a-zA-Z1-9-]+)/);
  if (r) {
    /* istanbul ignore else */
    if (r[1] === "?") {
      next ? node.setAttribute(r[2], "") : node.removeAttribute(r[2]);
    } else if (r[1] === ".") {
      (node as Element & { [name: string]: unknown })[r[2]] = next;
    } else if (r[1] === "@") {
      prev && node.removeEventListener(r[2], prev as EventListener);
      node.addEventListener(r[2], next as EventListener);
    }
  } else if (name === "...") {
    if (typeof next === "object" && next) {
      Object.keys(next).forEach(key =>
        commitAttribute(
          node,
          key,
          (next as ChProp<typeof next>)[key],
          prev && (prev as ChProp<typeof prev>)[key]
        )
      );
    }
  } else if (name === "ref") {
    typeof next === "function"
      ? next(node)
      : ((next as ChProp<typeof next>).current = node);
  } else {
    next != null && node.setAttribute(name, next as string);
  }
}

function commitNode(
  mutation: NodeMutation,
  next: unknown,
  prev: unknown,
  index: number
) {
  const base = next != null ? next : prev;
  if (base == null) return;
  if (Array.isArray(base)) {
    prev = prev || [];
    if (isTemplateMutation(mutation) && isTemplateHavingKey(base[0])) {
      commitTemplatesWithKey(
        mutation,
        next as HtmlTemplate[],
        prev as HtmlTemplate[]
      );
    } else {
      const ns = next as unknown[];
      const ps = prev as unknown[];
      for (let i = 0; i < ps.length || i < ns.length; i++) {
        commitNode(mutation, ns[i], ps[i], i);
      }
    }
  } else if (prev && next && !isTemplate(prev) && isTemplate(next)) {
    commitText(mutation as TextMutation, null, prev as string, index);
    commitTemplate(mutation as TemplateMutation, next, null, index);
  } else if (prev && next && isTemplate(prev) && !isTemplate(next)) {
    commitTemplate(mutation as TemplateMutation, null, prev, index);
    commitText(mutation as TextMutation, next as string, null, index);
  } else if (isTemplate(base)) {
    commitTemplate(
      mutation as TemplateMutation,
      next as HtmlTemplate,
      prev as HtmlTemplate,
      index
    );
  } else {
    commitText(mutation as TextMutation, next as string, prev as string, index);
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
          ? mutations[prevIndex]._marks[0]
          : parentMutation.node
      );
    } else if (
      prevKeys[prevIndex] != null &&
      !nextKeys.includes(prevKeys[prevIndex])
    ) {
      removeTemplate(mutations[prevIndex++]);
    } else {
      commit(
        (nextMutations[nextIndex++] = mutations[prevIndex++]),
        getArgs(next)
      );
    }
  }
  parentMutation._mutations = nextMutations;
}

function commitTemplate(
  m: TemplateMutation,
  next: HtmlTemplate | undefined | null,
  prev: HtmlTemplate | undefined | null,
  index: number
) {
  if (!prev) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (m._mutations = m._mutations || [])[index] = insertTemplate(next!, m.node);
  } else if (!next) {
    removeTemplate(m._mutations[index]);
    delete m._mutations[index];
  } else if (equalsTemplate(next, prev)) {
    commit(m._mutations[index], getArgs(next));
  } else {
    removeTemplate(m._mutations[index]);
    m._mutations[index] = insertTemplate(next, m.node);
  }
}

function commitText(
  m: TextMutation,
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
    removeNode(m._texts[index]);
    delete m._texts[index];
  } else if (next !== prev) {
    m._texts[index].data = next;
  }
}

function insertTemplate(template: HtmlTemplate, refNode: Node): ChildMutations {
  const [vdom, args] = items(template);
  const fragment = document.createDocumentFragment();
  const mutations = Object.assign([] as Mutation[], {
    _marks: [document.createComment(""), document.createComment("")] as const
  });
  mount(vdom, fragment, mutations);
  commit(mutations, args);
  insertNode(mutations._marks[0], refNode);
  insertNode(fragment, refNode);
  insertNode(mutations._marks[1], refNode);
  return mutations;
}

function removeTemplate(mutations: ChildMutations) {
  // eslint-disable-next-line prefer-const
  let [start, end] = mutations._marks;
  while (start !== end) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const next = start.nextSibling!;
    removeNode(start);
    start = next;
  }
  removeNode(end);
}

function insertNode(newNode: Node, refNode: Node) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  refNode.parentNode!.insertBefore(newNode, refNode);
}

function removeNode(node: Node) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  node.parentNode!.removeChild(node);
}
