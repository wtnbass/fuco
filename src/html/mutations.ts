export type Mutation = AttributeMutation | NodeMutation;

export interface NodeMutation {
  node: Node;
  isSvg: boolean;
  _prev?: unknown;
}

export interface AttributeMutation {
  node: Node;
  name: string;
  _prev?: unknown;
}

export interface TemplateMutation extends NodeMutation {
  _mutations: ChildMutations[];
}

export type ChildMutations = NodeMutation[] & {
  _marks: readonly [Node, Node];
};

export interface TextMutation extends NodeMutation {
  _texts: Text[];
}

export function isAttributeMutation(m: Mutation): m is AttributeMutation {
  return !!(m as AttributeMutation).name;
}

export function isTemplateMutation(m: Mutation): m is TemplateMutation {
  return !!(m as TemplateMutation)._mutations;
}
