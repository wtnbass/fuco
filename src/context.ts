/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { html as h } from "./html";
import { useProperty, useRef, useListenEvent } from "./hooks";
import { Context, ContextDetail, ContextSubscriber } from "./interfaces";
import { contextType } from "./consts";

export function createContext<T>(defaultValue?: T): Context<T> {
  const context = {
    _defaultValue: defaultValue,
    Provider() {
      const subs = useRef<ContextSubscriber<T>[]>([]);
      const value = useProperty<T>("value");
      subs.current!.forEach((f) => f(value));

      useListenEvent(contextType, (e: CustomEvent<ContextDetail<T>>) => {
        if (context === e.detail._context) {
          const subscribe = (s: ContextSubscriber<T>) => {
            const len = subs.current!.push(s);
            return () => subs.current!.splice(len - 1, 1);
          };
          e.stopPropagation();
          e.detail._register(subscribe)(value);
        }
      });

      return h`<slot/>`;
    },
  };
  (context.Provider as any)._context = context;
  return context;
}
