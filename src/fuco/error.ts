import { isBrowser } from "./env";
import { Component } from "./component";

export const errorType = "fuco.error." + String(Math.random()).slice(2);

export const invokeCatchError = <T>(
  callback: (c: Component, ...rest: T[]) => void
) => (c: Component, ...rest: T[]) => {
  try {
    callback(c, ...rest);
  } catch (e) {
    c._dispatch(errorType, { bubbles: true, composed: true, detail: e });
    /* develblock:start */
    if (process.env.BUILD_ENV === "development") {
      console.error(`Error in <${c._name}>`);
      callback(c, ...rest);
    }
    /* develblock:end */
  }
};

isBrowser &&
  window.addEventListener(errorType, e => {
    throw (e as CustomEvent<Error>).detail;
  });
