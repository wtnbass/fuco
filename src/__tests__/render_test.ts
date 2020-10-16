/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "chai";
import * as sinon from "sinon";
import { html, render } from "../fuco";
import { stripComments } from "./utils";

const h = html;

describe("render", () => {
  let container!: HTMLDivElement;

  function assertHtml(tmpl: unknown, innerHTML: string) {
    render(tmpl, container);
    expect(stripComments(container.innerHTML)).to.equal(innerHTML, "render");
  }

  beforeEach(() => {
    container = document.body.appendChild(document.createElement("div"));
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("simple", () => {
    const app = html` <div>Hello</div> `;
    assertHtml(app, `<div>Hello</div>`);
  });

  it("slash elements", () => {
    const app = html` <div /> `;
    assertHtml(app, "<div></div>");
  });

  it("void elements", () => {
    const app = h`
      <input><input /><INPUT>
    `;

    assertHtml(app, "<input><input><input>");
  });

  it("empty", () => {
    assertHtml(html``, "");
  });

  it("text", () => {
    const app = html`
      <div>Hello, ${"world"}</div>
      <div>number, ${100}</div>
      <div>true, ${true}</div>
      <div>false, ${false}</div>
    `;
    assertHtml(
      app,
      "<div>Hello, world</div>" +
        "<div>number, 100</div>" +
        "<div>true, true</div>" +
        "<div>false, false</div>"
    );
  });

  it("attributes", () => {
    const app = html`
      <div
        name="World"
        value=${"value"}
        data-num=${2}
        data-true=${true}
        data-false=${false}
        data-zero=${0}
        data-NaN=${NaN}
        data-null=${null}
        data-undefined=${undefined}
      ></div>
    `;
    assertHtml(
      app,
      "<div" +
        ' name="World"' +
        ' value="value"' +
        ' data-num="2"' +
        ' data-true="true"' +
        ' data-false="false"' +
        ' data-zero="0"' +
        ' data-nan="NaN"' +
        "></div>"
    );
  });

  it("no value attribute", () => {
    const app = html` <div foo bar="bar" baz></div> `;

    assertHtml(app, `<div foo="" bar="bar" baz=""></div>`);
  });

  it("key attribute", () => {
    const app = html` <div :key=${"a"}></div> `;
    assertHtml(app, `<div></div>`);
  });

  it("ref function attribute", () => {
    let refNode!: HTMLDivElement;
    const app = html`
      <div :ref=${(node: HTMLDivElement) => (refNode = node)}></div>
    `;
    render(app, container);
    expect(container.querySelector("div")).to.equal(refNode);
  });

  it("ref object attribute", () => {
    const ref = { current: null };
    const app = html` <div :ref=${ref}></div> `;
    render(app, container);
    expect(container.querySelector("div")).to.equal(ref.current);
  });

  it(":style object attribute", () => {
    const app = html`
      <div :style=${{ color: "red", backgroundColor: "grey" }}></div>
    `;
    assertHtml(app, '<div style="color: red; background-color: grey;"></div>');
  });

  it(":style non object attribute", () => {
    const app = html` <div :style=${"color:red"}></div> `;
    assertHtml(app, "<div></div>");
  });

  it(":class array attribute", () => {
    const app = html` <div :class=${["foo", "bar"]}></div> `;
    assertHtml(app, '<div class="foo bar"></div>');
  });

  it(":class object attribute", () => {
    const app = html`
      <div :class=${{ foo: true, bar: false, baz: true }}></div>
    `;
    assertHtml(app, '<div class="foo baz"></div>');
  });

  it(":class non object attribute", () => {
    const app = html` <div :class=${"foo bar"}></div> `;
    assertHtml(app, "<div></div>");
  });

  it("spread attribute", () => {
    const cb = sinon.spy();
    const props = { a: 1, "?b": 2, ".c": 3, "@d": cb };
    const app = html` <div ...${props}></div> `;
    assertHtml(app, '<div a="1" b=""></div>');
  });

  it("spread attribute should ignore string", () => {
    const app = html` <div ...${"props"}></div> `;
    assertHtml(app, "<div></div>");
  });

  it("spread attribute should ignore number", () => {
    const app = html` <div ...${1000}></div> `;
    assertHtml(app, "<div></div>");
  });

  it("spread attribute should ignore boolean", () => {
    const app = html` <div ...${true}></div> `;
    assertHtml(app, "<div></div>");
  });

  it("spread attribute should ignore array", () => {
    const app = html` <div ...${["a", "b", "c"]}></div> `;
    assertHtml(app, "<div></div>");
  });

  it("spread attribute should ignore template", () => {
    const app = html` <div ...${html``}></div> `;
    assertHtml(app, "<div></div>");
  });

  it("boolean attribute", () => {
    const app = html` <div ?yes=${true} ?no=${false}>Hello</div> `;
    assertHtml(app, `<div yes="">Hello</div>`);
  });

  it("property ", () => {
    const value = { name: "world" };
    const app = html` <div .value=${value}>Hello</div> `;
    assertHtml(app, `<div>Hello</div>`);
    expect((container.querySelector("div")! as any).value).to.equal(value);
  });

  it("evnet handler", () => {
    const cb = sinon.spy();
    const app = html` <button @click=${cb}>click</button> `;
    assertHtml(app, `<button>click</button>`);
    container.querySelector("button")!.click();
    expect(cb.calledOnce).to.be.true;
  });

  it("event object", () => {
    const listener = {
      handleEvent: sinon.spy(),
    };
    const app = html` <button @click=${listener}>click</button> `;
    assertHtml(app, `<button>click</button>`);
    container.querySelector("button")!.click();
    expect(listener.handleEvent.calledOnce).to.be.true;
  });

  it("bind not envent listener", () => {
    const listener = {
      foo: sinon.spy(),
    };
    const app = html` <button @click=${listener}>click</button> `;
    assertHtml(app, `<button>click</button>`);
    container.querySelector("button")!.click();
    expect(listener.foo.called).to.be.false;
  });

  it("array", () => {
    const app = html` <div>${["a", "b", "c"]}</div> `;
    assertHtml(app, `<div>abc</div>`);
  });

  it("template", () => {
    const app = html`
      <div>${["a", "b", "c"].map((s) => html` <input value=${s} /> `)}</div>
    `;
    assertHtml(
      app,
      "<div>" +
        '<input value="a">' +
        '<input value="b">' +
        '<input value="c">' +
        "</div>"
    );
  });

  it("falsy values", () => {
    const app = html`
      <div>0, ${0}</div>
      <div>NaN, ${NaN}</div>
      <div>null, ${null}</div>
      <div>undefined, ${undefined}</div>
    `;
    assertHtml(
      app,
      "<div>0, 0</div>" +
        "<div>NaN, NaN</div>" +
        "<div>null, </div>" +
        "<div>undefined, </div>"
    );
  });

  it("symbol", () => {
    const app = html` <div>${Symbol("test")}</div> `;
    assertHtml(app, "<div></div>");
  });

  it("symbol attriubte", () => {
    const app = html`
      <div
        foo=${Symbol("foo")}
        ?bar=${Symbol("bar")}
        .baz=${Symbol("baz")}
      ></div>
    `;
    assertHtml(app, "<div></div>");
  });

  it("raw string", () => {
    assertHtml("string", `string`);
  });

  it("raw number", () => {
    assertHtml(100, `100`);
  });

  it("raw boolean", () => {
    assertHtml(false, `false`);
  });

  it("raw array", () => {
    assertHtml(["a", "b", "c"], `abc`);
  });

  it("raw null", () => {
    assertHtml(null, ``);
  });

  it("raw undefined", () => {
    assertHtml(undefined, ``);
  });

  it("raw symbol", () => {
    assertHtml(Symbol(), "");
  });

  it("escaped value in template", () => {
    const app = h`
      <div>\n</div>
      <div>\2</div>
    `;
    assertHtml(app, "<div>\\n</div><div>\\2</div>");
  });

  it("unsafe html", () => {
    const app = html` <div .innerHTML=${"<p>unsafe</p>"}>ignored</div> `;

    assertHtml(app, "<div><p>unsafe</p></div>");
  });

  it("default value of <select>", () => {
    const defaultValue = "c";
    const app = html`
      <select .value=${defaultValue}>
        ${["a", "b", "c"].map((v) => html` <option value=${v}>${v}</option> `)}
      </select>
    `;

    render(app, container);
    expect(container.querySelector("select")!.value).to.be.equal(defaultValue);
  });

  it("ignore variable in comment", () => {
    const app = html`
      <!-- ${"ignore"} -->
      <div>${"foo"}</div>
    `;

    assertHtml(app, "<div>foo</div>");
  });

  it("XSS in node", () => {
    const XSS = ((window as any).XSS = sinon.spy());
    const app = html` <div>${"<script>XSS();</script>"}</div> `;
    render(app, container);
    expect(XSS.called).to.be.false;
  });

  it("XSS in attribute", () => {
    const XSS = ((window as any).XSS = sinon.spy());
    const app = html` <div foo=${"bar><script>XSS();</script><div"}></div> `;
    render(app, container);
    expect(XSS.called).to.be.false;
  });

  it("script in static string", () => {
    const NoXSS = ((window as any).NoXSS = sinon.spy());
    const app = html`
      <div>
        <script>
          NoXSS();
        </script>
      </div>
    `;
    render(app, container);
    expect(NoXSS.called).to.be.true;
  });

  it("start tag variable", () => {
    const app = html`
    <${"div"}></div>
    `;
    assertHtml(app, "&lt;div&gt;");
  });

  it("end tag variable", () => {
    const app = html`
    <div></${"div"}>
    `;
    assertHtml(app, "<div>&lt;/div&gt;</div>");
  });

  it("render SVG", () => {
    const app = html`
      <svg>
        <g></g>
      </svg>
    `;
    render(app, container);

    expect(container.querySelector("g")?.namespaceURI).to.equal(
      "http://www.w3.org/2000/svg"
    );
  });

  it("render SVG to bind html tag template in svg.", () => {
    const app = html` <svg>${html` <g></g> `}</svg> `;
    render(app, container);

    expect(container.querySelector("g")?.namespaceURI).to.equal(
      "http://www.w3.org/2000/svg"
    );
  });

  it("render SVG to bind html tag array template in svg.", () => {
    const app = html`
      <svg>
        <g>${[1, 2, 3].map((i) => html` <line x=${i}></line> `)}</g>
      </svg>
    `;
    render(app, container);

    for (const line of container.querySelectorAll("line")) {
      expect(line.namespaceURI).to.equal("http://www.w3.org/2000/svg");
    }
  });

  it("render SVG append to svg tag", () => {
    const app = html` <g></g> `;
    const svgcontainer = document.body.appendChild(
      document.createElement("svg")
    );
    render(app, svgcontainer);

    expect(svgcontainer.querySelector("g")?.namespaceURI).to.equal(
      "http://www.w3.org/2000/svg"
    );

    document.body.removeChild(svgcontainer);
  });

  it("SVG with variable", () => {
    const app = html`
      <svg>
        <g fill=${"white"}></g>
      </svg>
    `;
    assertHtml(app, `<svg><g fill="white"></g></svg>`);
  });
});
