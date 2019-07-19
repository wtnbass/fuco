import { Component } from "fuco/core";
import {
  h as _h,
  diff,
  patch,
  create,
  VNode,
  createProperties,
  VChild
} from "virtual-dom";

export * from "fuco/core";

export const h = (
  tagName: string,
  properties: createProperties,
  ...children: (string | VChild)[]
) => _h(tagName, properties, children);

export type FunctionComponent = () => VNode;

export function defineElement(name: string, f: FunctionComponent) {
  window.customElements.define(
    name,
    class extends Component {
      $vdom__tree: VNode | undefined;
      $vdom__root: Element | undefined;
      render() {
        const tree = f();

        if (this.$vdom__tree && this.$vdom__root) {
          const patches = diff(this.$vdom__tree, tree);
          this.$vdom__root = patch(this.$vdom__root, patches);
          this.$vdom__tree = tree;
        } else {
          this.$vdom__tree = tree;
          this.$vdom__root = create(this.$vdom__tree);
          this.$root.appendChild(this.$vdom__root);
        }
      }
    }
  );
}
