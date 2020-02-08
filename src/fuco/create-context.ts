import { html as h } from "../html";
import { useProperty, useRef } from "./hooks";
import { Context, ContextSubscriber, Detail, REQUEST_CONSUME } from "./context";

export function createContext<T>(defaultValue?: T): Context<T> {
  const context = {
    _defaultValue: defaultValue,
    Provider() {
      const subs = useRef<ContextSubscriber<T>[]>([]);
      const value = useProperty<T>("value");

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      subs.current!.forEach(f => f(value));

      const request = (e: CustomEvent<Detail<T>>) => {
        if (context === e.detail._context) {
          const subscribe = (s: ContextSubscriber<T>) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const len = subs.current!.push(s);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return () => subs.current!.splice(len - 1, 1);
          };
          e.stopPropagation();
          e.detail._register(subscribe)(value);
        }
      };
      return h`<slot ...${{ [`@${REQUEST_CONSUME}`]: request }}/>`;
    }
  };
  return context;
}
