export type Mutation = AttributeMutation | NodeMutation;

export type NodeMutation =
  | TemplateMutation
  | TextMutation
  | { node: Node; prev?: unknown };

export type AttributeMutation = {
  node: Node;
  name: string;
  prev?: unknown;
};

export type TemplateMutation = {
  node: Node;
  _mutations: ChildMutations[];
  prev?: unknown;
};

export type ChildMutations = Mutation[] & {
  _marks: readonly [Node, Node];
};

export type TextMutation = {
  node: Node;
  _texts: Text[];
  prev?: unknown;
};

export function isAttributeMutation(m: Mutation): m is AttributeMutation {
  return !!(m as AttributeMutation).name;
}

export function isTemplateMutation(m: Mutation): m is TemplateMutation {
  return !!(m as TemplateMutation)._mutations;
}

export function isTextMutation(m: Mutation): m is TextMutation {
  return !!(m as TextMutation)._texts;
}
