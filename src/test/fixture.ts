/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { defineElement } from "..";
import { FunctionalComponent } from "../component";

const genElementName = () =>
  ["test", Date.now(), String(Math.random()).slice(2)].join("-");

function mountFixture(html: string | Element) {
  const fixture = document.createElement("div");
  fixture.id = "fixture";
  if (typeof html === "string") {
    fixture.innerHTML = html;
  } else {
    fixture.appendChild(html);
  }

  document.body.appendChild(fixture);
}

export function unmountFixture() {
  const fixture = document.getElementById("fixture");
  fixture && document.body.removeChild(fixture);
}

export function withFixture(
  fixture: FunctionalComponent,
  fn: (elName: string) => void
) {
  return () => {
    const elName = genElementName();

    beforeAll(() => {
      defineElement(elName, fixture);
    });

    beforeEach(() => {
      mountFixture(document.createElement(elName));
    });

    afterEach(() => {
      unmountFixture();
    });

    fn(elName);
  };
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
