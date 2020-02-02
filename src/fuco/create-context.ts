// import html as h to avoid format by prettier
import { html as h } from "../html";
import { defineElement } from "./define-element";
import { useProperty, useRef, useEffect } from "./hooks";
import { Context, ContextSubscriber, Detail, REQUEST_CONSUME } from "./context";

export function createContext<T>(defaultValue?: T): Context<T> {
  const context = {
    _defaultValue: defaultValue,
    Provider() {
      const subs = useRef<ContextSubscriber<T>[]>([]);
      const subscribe = (s: ContextSubscriber<T>) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const len = subs.current!.push(s);
        return () => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          subs.current!.splice(len - 1, 1);
        };
      };

      const value = useProperty<T>("value");
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      useEffect(() => subs.current!.forEach(f => f(value)), [value]);

      const request = (e: CustomEvent<Detail<T>>) => {
        if (context === e.detail._context) {
          e.stopPropagation();
          e.detail._register(subscribe, value);
        }
      };
      return h`<slot ...${{ [`@${REQUEST_CONSUME}`]: request }}/>`;
    },
    defineProvider(name: string) {
      defineElement(name, context.Provider);
    }
  };
  return context;
}
