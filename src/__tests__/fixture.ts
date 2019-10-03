/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineElement, FunctionalComponent } from "..";

function waitFor() {
  return new Promise(resolve => setTimeout(resolve, 8));
}

export const selector = <T extends Element>(s: string, hasShadow?: Element) =>
  (hasShadow ? hasShadow.shadowRoot! : document).querySelector<T>(s)!;

export const selectorAll = <T extends Element>(
  s: string,
  hasShadow?: Element
) => (hasShadow ? hasShadow.shadowRoot! : document).querySelectorAll<T>(s)!;

export const text = (el: Element) => el.textContent!.trim();

export function createFixture(fixtureFn: FunctionalComponent) {
  const name = ["test", Date.now(), String(Math.random()).slice(2)].join("-");

  return {
    get name() {
      return name;
    },
    async setup() {
      await waitFor();
      return selector(name);
    },
    define() {
      defineElement(name, fixtureFn);
    },
    mount() {
      const fixture = document.createElement(name);
      document.body.appendChild(fixture);
    },
    unmount() {
      const fixtures = document.getElementsByTagName(name);
      for (const fixture of fixtures) {
        fixture && document.body.removeChild(fixture);
      }
    }
  };
}

export const withFixtures = (...fixtureFns: FunctionalComponent[]) => (
  fn: (fixtures: ReturnType<typeof createFixture>[]) => void
) => () => {
  const fixtures = fixtureFns.map(createFixture);
  beforeAll(() => {
    fixtures.forEach(f => f.define());
  });

  beforeEach(() => {
    fixtures.forEach(f => f.mount());
  });

  afterEach(() => {
    fixtures.forEach(f => f.unmount());
  });

  fn(fixtures);
};
