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
