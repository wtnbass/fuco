/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function */
import { expect } from "chai";
import { html } from "..";
import { items } from "../template";

describe("parse", () => {
  let container!: HTMLDivElement;

  function test(tmpl: any, vdom?: unknown, args?: unknown[], key?: unknown) {
    const [actualVdom, actualArgs, actualKey] = items(tmpl);
    expect(vdom).to.deep.equal(actualVdom, "vdom");
    if (args) {
      expect(args).to.deep.equal(Array.from(actualArgs).slice(1), "variables");
    }
    if (key != null) {
      expect(key).to.equal(actualKey, "key");
    }
  }

  beforeEach(() => {
    container = document.body.appendChild(document.createElement("div"));
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("single", () => {
    const app = html`
      <div>hello</div>
    `;

    test(app, [{ tag: "div", children: ["hello"] }]);
  });

  it("multiple", () => {
    const app = html`
      <div>hello</div>
      <div>world</div>
    `;

    test(app, [
      { tag: "div", children: ["hello"] },
      { tag: "div", children: ["world"] }
    ]);
  });

  it("has attribute", () => {
    const app = html`
      <div name="greet">hello</div>
    `;

    test(app, [{ tag: "div", props: { name: "greet" }, children: ["hello"] }]);
  });

  it("has text variables", () => {
    const app = html`
      <div>hello, ${"world"}, ${1000}</div>
    `;

    test(
      app,
      [{ tag: "div", children: ["hello, ", 1, ", ", 2] }],
      ["world", 1000]
    );
  });

  it("has attribute variables", () => {
    const cb = () => {};
    const app = html`
      <div
        name="greet"
        class=${"wrapper"}
        @click=${cb}
        .value=${"value"}
        ?yes=${true}
      >
        hello
      </div>
    `;

    test(
      app,
      [
        {
          tag: "div",
          props: {
            name: "greet",
            class: 1,
            "@click": 2,
            ".value": 3,
            "?yes": 4
          },
          children: ["hello"]
        }
      ],
      ["wrapper", cb, "value", true]
    );
  });

  it("spread attribute", () => {
    const props = { a: 1, "?b": 2, ".c": 3, "@d": () => {} };
    // prettier-ignore
    const app = html`
      <div ...${props}></div>
      <div ...  ${props}   ></div>
    `;

    test(
      app,
      [
        { tag: "div", props: { "...": 1 }, children: [] },
        { tag: "div", props: { "...": 2 }, children: [] }
      ],
      [props, props]
    );
  });

  it("has static key", () => {
    const app = html`
      <div key="99">hello</div>
    `;

    test(
      app,
      [{ tag: "div", props: { key: "99" }, children: ["hello"] }],
      [],
      "99"
    );
  });

  it("has variable key", () => {
    const app = html`
      <div key=${80}>hello</div>
    `;

    test(
      app,
      [{ tag: "div", props: { key: 1 }, children: ["hello"] }],
      [80],
      80
    );
  });

  it("closed elements", () => {
    const app = html`
      <div class="test" />
    `;

    test(app, [{ tag: "div", props: { class: "test" }, children: [] }]);
  });

  it("ignore unexpected enclosing tag", () => {
    const app = html`
      <div><p><b></p></b></div></main>
    `;

    test(app, [
      {
        tag: "div",
        children: [{ tag: "p", children: [{ tag: "b", children: [] }] }]
      }
    ]);
  });

  it("includes unclosed tag", () => {
    const app = html`
    <div>
      <b>unclosed
      <p>tag</p>
    </div>
    <small>end
  `;

    test(app, [
      {
        tag: "div",
        children: [
          { tag: "b", children: ["unclosed", { tag: "p", children: ["tag"] }] }
        ]
      },
      { tag: "small", children: ["end"] }
    ]);
  });

  it("ugly attributes", () => {
    // prettier-ignore
    const app = html`
      <div name  =  "a" id  = 'b' class = c  color =  d></div>
    `
    test(app, [
      {
        tag: "div",
        props: {
          name: "a",
          id: "b",
          class: "c",
          color: "d"
        },
        children: []
      }
    ]);
  });

  it("doctype", () => {
    const app = html`
      <!DOCTYPE html>
      <div>doctype</div>
    `;

    test(app, [{ tag: "div", children: ["doctype"] }]);
  });

  it("comment", () => {
    const app = html`
      <!-- comment -->
      <div>comment</div>
      <!--  -->
      <!-->
    `;
    test(app, [{ tag: "div", children: ["comment"] }]);
  });
  it("invalid comment", () => {
    const app = html`
      <div><!-- ->in comment --></div>
      <div><!- --></div>
    `;
    test(app, [
      { tag: "div", children: [] },
      { tag: "div", children: ["<!- -->"] }
    ]);
  });

  it("ignore variables in comment", () => {
    const app = html`
      <!-- ${0} -->
    `;
    test(app, [], [0]);
  });
});
