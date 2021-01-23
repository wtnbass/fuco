import { isBrowser } from "./env";
import { Component } from "./interfaces";
import { errorType } from "./consts";

export const invokeCatchError = <T>(
  callback: (c: Component, ...rest: T[]) => void
) => (c: Component, ...rest: T[]) => {
  try {
    callback(c, ...rest);
  } catch (e) {
    c._dispatch(errorType, { bubbles: true, composed: true, detail: e });
    if (process.env.BUILD_ENV === "development") {
      console.error(`Error in <${c._componentName}>`);
      callback(c, ...rest);
    }
  }
};

isBrowser &&
  window.addEventListener(errorType, (e) => {
    throw (e as CustomEvent<Error>).detail;
  });
