import { expect } from "chai";
import { renderToString } from "../server";
import {
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
  useCallback,
} from "../fuco";
import { series } from "./utils";
import { getCssString } from "../css";

describe("render-to-string", () => {
  it("simple", () => {
    const s = renderToString(html` <div>Hello</div> `);
    expect(s).to.equal(`<div>Hello</div>`);
  });

  it("slash element", () => {
    const s = renderToString(html` <div /> `);
    expect(s).to.equal(`<div></div>`);
  });

  it("void element", () => {
    const s = renderToString(html` <input /> `);
    expect(s).to.equal(`<input>`);
  });

  it("attributes", () => {
    const s = renderToString(html`
      <div
        name="a"
        .foo=${"foo"}
        @bar=${() => 1}
        ?baz=${!0}
        novalue
        nullvalue=${null}
        ...${{ spread: "spread", ".value": "value" }}
      >
        Hello
      </div>
    `);
    expect(s).to.equal(`<div name="a" baz novalue spread="spread">Hello</div>`);
  });

  it("class array", () => {
    const s = renderToString(html` <div :class=${["foo", "bar"]}>Hello</div> `);
    expect(s).to.equal(`<div class="foo bar">Hello</div>`);
  });

  it("class object", () => {
    const s = renderToString(html`
      <div :class=${{ foo: true, bar: false }}>Hello</div>
    `);
    expect(s).to.equal(`<div class="foo">Hello</div>`);
  });

  it("style object", () => {
    const s = renderToString(html`
      <div :style=${{ color: "red", backgroundColor: "grey" }}>Hello</div>
    `);
    expect(s).to.equal(
      `<div style="color: red; background-color: grey;">Hello</div>`
    );
  });

  it("text or template", () => {
    const s = renderToString(html`
      <div>${"Hello"}${0}${false}${undefined}${null}</div>
      <div>
        ${html`
          <div>template</div>
          ${"foo"}
        `}
      </div>
    `);
    expect(s).to.equal(
      `<div>Hello0false</div><div><div>template</div>foo</div>`
    );
  });

  it("string", () => {
    const s = renderToString("string");
    expect(s).to.equal(`string`);
  });

  it("number", () => {
    const s = renderToString(0);
    expect(s).to.equal(`0`);
  });

  it("boolean", () => {
    const s = renderToString(false);
    expect(s).to.equal(`false`);
  });

  it("undefined", () => {
    const s = renderToString(undefined);
    expect(s).to.equal(``);
  });

  it("null", () => {
    const s = renderToString(null);
    expect(s).to.equal(``);
  });

  it("array", () => {
    const s = renderToString(
      ["a", "b", "c"].map((v) => html` <div>${v}</div> `)
    );
    expect(s).to.equal(`<div>a</div><div>b</div><div>c</div>`);
  });

  it("select", () => {
    const s = renderToString(html`
      <select .value=${"b"}>
        ${["a", "b", "c"].map((v) => html` <option value=${v}>${v}</option> `)}
      </select>
    `);
    expect(s).to.equal(
      series(`
      <select>
        <option value="a">a</option>
        <option value="b" selected>b</option>
        <option value="c">c</option>
      </select>
    `)
    );
  });

  describe("component", () => {
    afterEach(() => {
      for (const key in $fucoGlobal.__defs) delete $fucoGlobal.__defs[key];
    });

    it("simple component", () => {
      defineElement("test-element", () => html` <div>fuco element</div> `);

      const s = renderToString(html` <test-element></test-element> `);

      expect(s).to.equal(
        series(`
        <test-element>
          <template shadowroot="open">
            <div>fuco element</div>
          </template>
        </test-element>
      `)
      );
    });

    it("nested", () => {
      defineElement("test-1", () => html` <test-2></test-2> `);
      defineElement("test-2", () => html` <div>test</div> `);

      const s = renderToString(html` <test-1></test-1> `);

      expect(s).to.equal(
        series(`
        <test-1>
          <template shadowroot="open">
            <test-2>
              <template shadowroot="open">
                <div>test</div>
              </template>
            </test-2>
          </template>
        </test-1>
      `)
      );
    });

    it("slot", () => {
      defineElement("test-slot", () => html` <div>Hello, <slot></slot></div> `);

      const s = renderToString(html` <test-slot>World</test-slot> `);

      expect(s).to.equal(
        series(`
        <test-slot>
          <template shadowroot="open">
            <div>Hello, <slot></slot></div>
          </template>
          World
        </test-slot>
      `)
      );
    });

    it("named slot", () => {
      defineElement(
        "test-slot",
        () => html`
          <header><slot name="header"></slot></header>
          <footer><slot name="footer"></slot></footer>
        `
      );

      const s = renderToString(html`
        <test-slot>
          <div slot="header">Header</div>
          <div slot="footer">Footer</div>
        </test-slot>
      `);

      expect(s).to.equal(
        series(`
        <test-slot>
          <template shadowroot="open">
            <header><slot name="header"></slot></header>
            <footer><slot name="footer"></slot></footer>
          </template>
          <div slot="header">Header</div>
          <div slot="footer">Footer</div>
        </test-slot>
      `)
      );
    });

    it("mixed slot", () => {
      defineElement(
        "test-slot",
        () => html`
          <header><slot name="header"></slot></header>
          <slot></slot>
          <footer><slot name="footer"></slot></footer>
        `
      );

      const s = renderToString(html`
        <test-slot>
          <div slot="header">Header</div>
          <main>Content</main>
          <div slot="header">Header2</div>
          <div slot="footer">Footer A</div>
          <article>Article</article>
          <div slot="footer">Footer B</div>
          <div slot="otherwise">ignored</div>
        </test-slot>
      `);

      expect(s).to.equal(
        series(`
        <test-slot>
          <template shadowroot="open">
            <header><slot name="header"></slot></header>
            <slot></slot>
            <footer><slot name="footer"></slot></footer>
          </template>
          <div slot="header">Header</div>
          <main>Content</main>
          <div slot="header">Header2</div>
          <div slot="footer">Footer A</div>
          <article>Article</article>
          <div slot="footer">Footer B</div>
          <div slot="otherwise">ignored</div>
        </test-slot>
      `)
      );
    });

    it("attributes", () => {
      const s = renderToString(html`
        <div
          attr=${"foo"}
          .prop=${"bar"}
          @evnt=${() => !1}
          ?bool-true=${true}
          ?bool-false=${false}
          .innerHTML=${"<p>unsafe</p>"}
          :key=${"ignored"}
          :ref=${() => !1}
          ...${{ "spread-attr": "spread", ".spreadProp": "baz" }}
        >
          ignored
        </div>
      `);

      expect(s).to.equal(
        '<div attr="foo" bool-true spread-attr="spread"><p>unsafe</p></div>'
      );
    });
  });

  describe("component with hooks", () => {
    afterEach(() => {
      for (const key in $fucoGlobal.__defs) delete $fucoGlobal.__defs[key];
    });

    it("hooks ", () => {
      const Context = createContext("initial context value");
      const style = css`
        div {
          color: red;
        }
      `;
      defineElement("hooks-element", () => {
        const attribute = useAttribute("attribute");
        const property = useProperty("property");
        const dispatch = useDispatchEvent("noooop");
        useStyle(style);
        const ref = useRef("ref");
        const [state] = useState("state");
        const [state2] = useReducer(() => "REDUCER", "reducer");
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
        series(`
          <hooks-element attribute="ATTR">
            <template shadowroot="open">
              <style>#{style}</style>
              <div>attribute: ATTR</div>
              <div>property: PROP</div>
              <div>dispatch event</div>
              <div>ref: ref</div>
              <div>state: state</div>
              <div>reducer: reducer</div>
              <div>context: initial context value</div>
              <div>memo: memo</div>
            </template>
          </hooks-element>
        `).replace("#{style}", getCssString(style))
      );
    });

    it("attributes", () => {
      defineElement("attr-element", () => {
        const attr = useAttribute("attr");
        const prop = useProperty("prop");
        const btrue = useAttribute("bool-true", (value) => value != null);
        const bfalse = useAttribute("bool-false", (value) => value != null);
        const spreadAttr = useAttribute("spread-attr");
        const spreadProp = useProperty("spreadProp");
        const none = useAttribute("xxxxx");

        return html`
          <div>attr: ${attr}</div>
          <div>prop: ${prop}</div>
          <div>bool-true: ${btrue}</div>
          <div>bool-false: ${bfalse}</div>
          <div>spread-attr: ${spreadAttr}</div>
          <div>spread-prop: ${spreadProp}</div>
          <div>none: ${none}</div>
        `;
      });

      const s = renderToString(html`
        <attr-element
          attr=${"foo"}
          .prop=${"bar"}
          @evnt=${() => !1}
          ?bool-true=${true}
          ?bool-false=${false}
          .innerHTML=${"inner"}
          :key=${"ignored"}
          :ref=${() => !1}
          ...${{ "spread-attr": "spread", ".spreadProp": "baz" }}
        ></attr-element>
      `);

      expect(s).to.equal(
        series(`
      <attr-element attr="foo" bool-true spread-attr="spread">
        <template shadowroot="open">
          <div>attr: foo</div>
          <div>prop: bar</div>
          <div>bool-true: true</div>
          <div>bool-false: false</div>
          <div>spread-attr: spread</div>
          <div>spread-prop: baz</div>
          <div>none: </div>
        </template>
        inner
      </attr-element>
    `)
      );
    });

    it("inherits provider value", () => {
      const Context = createContext("default");
      defineElement("x-provider", Context.Provider);
      defineElement("x-consumer", () => {
        const value = useContext(Context);
        return html` <div>${value}</div> `;
      });
      const s = renderToString(html`
        <x-provider .value=${"provider"}>
          <x-consumer></x-consumer>
        </x-provider>
        <x-consumer></x-consumer>
      `);
      expect(s).to.equal(
        series(`
      <x-provider>
        <template shadowroot="open">
          <slot></slot>
        </template>
        <x-consumer>
          <template shadowroot="open">
            <div>provider</div>
          </template>
        </x-consumer>
      </x-provider>
      <x-consumer>
        <template shadowroot="open">
          <div>default</div>
        </template>
      </x-consumer>
    `)
      );
    });
  });
});
