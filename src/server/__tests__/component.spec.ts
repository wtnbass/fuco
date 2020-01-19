import { expect } from "chai";
import { renderToString } from "..";
import {
  __FucoRegistry__,
  html,
  css,
  createContext,
  defineElement,
  useAttribute,
  useProperty,
  useDispatchEvent,
  useStyle,
  useRef,
  useState,
  useReducer,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback
} from "../../fuco";

describe("component", () => {
  afterEach(() => {
    for (const key in __FucoRegistry__) delete __FucoRegistry__[key];
  });

  it("hooks ", () => {
    const Context = createContext("initial context value");
    defineElement("hooks-element", () => {
      const attribute = useAttribute("attribute");
      const property = useProperty("property");
      const dispatch = useDispatchEvent("noooop");
      // TODO: render style tags
      useStyle(css`
        div {
          color: red;
        }
      `);
      const ref = useRef("ref");
      const [state] = useState("state");
      const [state2] = useReducer(() => "REDUCER", "reducer");
      // TODO: provider
      const context = useContext(Context);
      useEffect(() => console.log("effect"));
      useLayoutEffect(() => console.log("layout effect"));
      const memo = useMemo(() => "me" + "mo");
      useCallback(() => console.log("callback"));

      return html`
        <div>attribute: ${attribute}</div>
        <div>property: ${property}</div>
        <div @click=${() => dispatch("")}>dispatch event</div>
        <div>ref: ${ref.current}</div>
        <div>state: ${state}</div>
        <div>reducer: ${state2}</div>
        <div>context: ${context}</div>
        <div>memo: ${memo}</div>
      `;
    });

    const s = renderToString(html`
      <hooks-element attribute="ATTR" .property=${"PROP"}></hooks-element>
    `);

    expect(s).to.equal(
      '<hooks-element attribute="ATTR">' +
        "<shadowroot>" +
        "<div>attribute: ATTR</div>" +
        "<div>property: PROP</div>" +
        "<div>dispatch event</div>" +
        "<div>ref: ref</div>" +
        "<div>state: state</div>" +
        "<div>reducer: reducer</div>" +
        "<div>context: initial context value</div>" +
        "<div>memo: memo</div>" +
        "</shadowroot>" +
        "</hooks-element>"
    );
  });

  it("attributes", () => {
    defineElement("attr-element", () => {
      const attr = useAttribute("attr");
      const prop = useProperty("prop");
      const btrue = useAttribute("bool-true", value => value != null);
      const bfalse = useAttribute("bool-false", value => value != null);
      const spreadAttr = useAttribute("spread-attr");
      const spreadProp = useProperty("spreadProp");

      return html`
        <div>attr: ${attr}</div>
        <div>prop: ${prop}</div>
        <div>bool-true: ${btrue}</div>
        <div>bool-false: ${bfalse}</div>
        <div>spread-attr: ${spreadAttr}</div>
        <div>spread-prop: ${spreadProp}</div>
      `;
    });

    const s = renderToString(html`
      <attr-element
        attr=${"foo"}
        .prop=${"bar"}
        @evnt=${() => !1}
        ?bool-true=${true}
        ?bool-false=${false}
        .innerHTML=${"ignored"}
        :key=${"ignored"}
        :ref=${() => !1}
        ...${{ "spread-attr": "spread", ".spreadProp": "baz" }}
      ></attr-element>
    `);

    expect(s).to.equal(
      '<attr-element attr="foo" bool-true spread-attr="spread">' +
        "<shadowroot>" +
        "<div>attr: foo</div>" +
        "<div>prop: bar</div>" +
        "<div>bool-true: true</div>" +
        "<div>bool-false: false</div>" +
        "<div>spread-attr: spread</div>" +
        "<div>spread-prop: baz</div>" +
        "</shadowroot>" +
        "</attr-element>"
    );
  });
});
