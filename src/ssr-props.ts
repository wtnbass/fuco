import { VProps, Holes } from "./interfaces";

const camelToKebab = (s: string) =>
  s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

const getValue = (o: unknown, key: string) =>
  (o as { [key: string]: unknown })[key];

export class SsrProps {
  tag: string;
  selectValue: string | undefined;
  attributes: { [name: string]: string };
  properties: { [name: string]: unknown };

  constructor(tag: string, selectValue?: string) {
    this.tag = tag;
    this.selectValue = selectValue;
    this.attributes = {};
    this.properties = {};
  }

  commit(props: VProps, holes?: Holes) {
    for (const name in props) {
      let value = props[name] as unknown;
      if (typeof value === "number" && holes) value = holes[value];
      if (name === "...") {
        this.commit(value as VProps);
      } else if (name[0] === "?") {
        if (value) this.attributes[name.slice(1)] = "";
      } else if (name[0] === ".") {
        this.properties[name.slice(1)] = value;
      } else if (name === ":class") {
        if (typeof value === "object" && value != null) {
          if (!Array.isArray(value)) {
            value = Object.keys(value).filter((i) => getValue(value, i));
          }
          this.attributes.class = (value as unknown[]).join(" ");
        }
      } else if (name === ":style") {
        if (typeof value === "object" && value != null) {
          this.attributes.style = Object.keys(value)
            .map((key) => `${camelToKebab(key)}: ${getValue(value, key)};`)
            .join(" ");
        }
      } else if (name[0] !== "@" && name[0] !== ":" && value != null) {
        this.attributes[name] = String(value);
      }

      const { tag, selectValue } = this;
      if (tag === "option" && name === "value" && value === selectValue) {
        this.attributes.selected = "";
        this.selectValue = undefined;
      }
      if (tag === "select" && name === ".value" && value != null) {
        this.selectValue = value as string;
      }
    }
  }

  getAttributeString() {
    return Object.entries(this.attributes).reduce<string>(
      (acc, [name, value]) => {
        const attr = value === "" ? name : `${name}="${value}"`;
        return `${acc} ${attr}`;
      },
      ""
    );
  }
}
