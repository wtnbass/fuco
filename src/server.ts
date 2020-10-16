import { ssr } from "./ssr";

export function renderToString(value: unknown): string {
  return ssr(1, [0, value]);
}
