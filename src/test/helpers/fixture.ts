/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function mountFixture(html: string) {
  const fixture = document.createElement("div");
  fixture.id = "fixture";
  fixture.innerHTML = html;
  document.body.appendChild(fixture);
}

export function unmountFixture() {
  const fixture = document.getElementById("fixture");
  fixture && document.body.removeChild(fixture);
}

export function selectFixture(selector: string) {
  const fixture = document.getElementById("fixture")!;
  return fixture.querySelector(selector)!;
}

export const selector = <T extends Element>(s: string, hasShadow?: Element) =>
  (hasShadow ? hasShadow.shadowRoot! : document).querySelector<T>(s)!;

export const selectorAll = <T extends Element>(
  s: string,
  hasShadow?: Element
) => (hasShadow ? hasShadow.shadowRoot! : document).querySelectorAll<T>(s)!;

export const text = (el: Element) => el.textContent!.trim();

export function waitFor() {
  return new Promise(resolve => setTimeout(resolve));
}
