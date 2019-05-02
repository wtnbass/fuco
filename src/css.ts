export const cssSymbol = Symbol("css");

export interface HasCSSSymbol {
  [cssSymbol]: string;
}

const hasCSSSymbol = (value: unknown): value is HasCSSSymbol => {
  return typeof value === "object" && value != null && cssSymbol in value;
};

const replace = (value: unknown): string => {
  if (typeof value === "number") return String(value);
  if (hasCSSSymbol(value)) return value[cssSymbol];
  throw new TypeError();
};

export const css = (strings: ReadonlyArray<string>, ...values: unknown[]) => ({
  [cssSymbol]: strings
    .slice(1)
    .reduce((acc, s, i) => acc + replace(values[i] + s), strings[0])
});
