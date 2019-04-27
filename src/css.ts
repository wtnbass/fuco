export const cssSymbol = Symbol("css");

const replace = (value: any): string => {
  if (typeof value === "number") return String(value);
  if (cssSymbol in value) return value[cssSymbol];
  throw new TypeError();
};

export const css = (strings: ReadonlyArray<string>, ...values: unknown[]) => ({
  [cssSymbol]: strings
    .slice(1)
    .reduce((acc, s, i) => acc + replace(values[i] + s), strings[0])
});
