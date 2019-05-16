export const cssSymbol = Symbol("css");

export interface HasCSSSymbol {
  [cssSymbol]: string;
}

const hasCSSSymbol = (value: unknown): value is HasCSSSymbol => {
  return typeof value === "object" && value != null && cssSymbol in value;
};

const resolve = (value: unknown): string => {
  if (typeof value === "number") return String(value);
  if (hasCSSSymbol(value)) return value[cssSymbol];
  if (value instanceof URL) return value.href;
  throw new TypeError(`${value} is not supported type.`);
};

export const css = (strings: ReadonlyArray<string>, ...values: unknown[]) => ({
  [cssSymbol]: strings
    .slice(1)
    .reduce((acc, s, i) => acc + resolve(values[i]) + s, strings[0])
});

export const unsafeCSS = (css: string) => ({ [cssSymbol]: css });
