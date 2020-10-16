/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineElement, FunctionalComponent } from "../fuco";

function waitFor() {
  return new Promise((resolve) => setTimeout(resolve, 10));
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
    },
  };
}

export const withFixtures = (...fixtureFns: FunctionalComponent[]) => (
  fn: (fixtures: ReturnType<typeof createFixture>[]) => void
) => () => {
  const fixtures = fixtureFns.map(createFixture);
  before(() => {
    fixtures.forEach((f) => f.define());
  });

  beforeEach(() => {
    fixtures.forEach((f) => f.mount());
  });

  afterEach(() => {
    fixtures.forEach((f) => f.unmount());
  });

  fn(fixtures);
};

export const createCaughtErrorPromise = () => {
  const originalOnError = (global as any).onerror;

  return new Promise((resolve, reject) => {
    (global as any).onerror = null;
    function rollbackErrorHandler() {
      (global as any).onerror = originalOnError;
      window.removeEventListener("error", handleUncaughtError);
    }
    const id = setTimeout(() => {
      rollbackErrorHandler();
      reject(new Error("timeout to catch uncaughtError"));
    }, 1500);
    function handleUncaughtError(e: Event) {
      e.preventDefault();
      clearTimeout(id);
      rollbackErrorHandler();
      resolve();
    }
    window.addEventListener("error", handleUncaughtError);
  });
};
