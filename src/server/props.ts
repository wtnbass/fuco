import { VProps, ArgValues } from "../html";

type Parent = {
  tag: string;
  selectValue?: string;
  attributes: { [name: string]: string };
  properties: { [name: string]: unknown };
};

export const createParent = (tag: string, selectValue?: string): Parent => ({
  tag,
  selectValue,
  attributes: {},
  properties: {}
});

const camelToKebab = (s: string) =>
  s.replace(/[A-Z]/g, c => "-" + c.toLowerCase());

export const propsToParent = (
  parent: Parent,
  props: VProps,
  args: ArgValues | undefined
) => {
  const _props = (props: VProps, args?: ArgValues) => {
    for (const name in props) {
      let value = props[name] as unknown;
      if (typeof value === "number" && args) value = args[value];
      if (name === "...") {
        _props(value as VProps);
      } else if (name[0] === "?") {
        if (value) parent.attributes[name.slice(1)] = "";
      } else if (name[0] === ".") {
        parent.properties[name.slice(1)] = value;
      } else if (name === ":class") {
        if (typeof value === "object" && value != null) {
          if (!Array.isArray(value)) {
            value = Object.keys(value).filter(i => (value as any)[i]);
          }
          parent.attributes.class = (value as unknown[]).join(" ");
        }
      } else if (name === ":style") {
        if (typeof value === "object" && value != null) {
          parent.attributes.style = Object.keys(value)
            .map(key => `${camelToKebab(key)}: ${(value as any)[key]};`)
            .join(" ");
        }
      } else if (name[0] !== "@" && name[0] !== ":" && value != null) {
        parent.attributes[name] = String(value);
      }

      const { tag, selectValue } = parent;
      if (tag === "option" && name === "value" && value === selectValue) {
        parent.attributes.selected = "";
        parent.selectValue = undefined;
      }
      if (tag === "select" && name === ".value" && value != null) {
        parent.selectValue = value as string;
      }
    }
  };

  _props(props, args);
};
