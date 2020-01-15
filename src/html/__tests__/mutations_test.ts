/* eslint-disable
  @typescript-eslint/no-non-null-assertion,
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/camelcase
*/
import { expect } from "chai";
import * as sinon from "sinon";
import { html, render } from "..";
import { stripComments } from "./utils";

describe("mutations", () => {
  let container!: HTMLDivElement;

  beforeEach(() => {
    container = document.body.appendChild(document.createElement("div"));
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("text", () => {
    const app = (text: any) => html`
      <div>${text}</div>
    `;

    render(app("string"), container);
    expect(container.querySelector("div")!.innerText).to.equal("string");

    render(app("change"), container);
    expect(container.querySelector("div")!.innerText).to.equal("change");

    render(app(1000), container);
    expect(container.querySelector("div")!.innerText).to.equal("1000");

    render(app(true), container);
    expect(container.querySelector("div")!.innerText).to.equal("true");

    render(app(false), container);
    expect(container.querySelector("div")!.innerText).to.equal("false");
  });

  it("text array", () => {
    const app = (...args: any[]) => html`
      <div>${args}</div>
    `;

    // first
    render(app("a", "b", "c"), container);
    expect(container.querySelector("div")!.innerText).to.equal("abc");

    // change
    render(app("d", "e", "f"), container);
    expect(container.querySelector("div")!.innerText).to.equal("def");

    // add
    render(app("d", "e", "f", "g", "h"), container);
    expect(container.querySelector("div")!.innerText).to.equal("defgh");

    // remove
    render(app("e", "f", "g"), container);
    expect(container.querySelector("div")!.innerText).to.equal("efg");

    // remove and insert
    render(app("z", "e", "g", "a", "b"), container);
    expect(container.querySelector("div")!.innerText).to.equal("zegab");
  });

  it("template", () => {
    const app = (inner: unknown) => html`
      <div>
        ${html`
          <p>${inner}</p>
        `}
      </div>
    `;

    render(app("foo"), container);
    expect(stripComments(container.querySelector("div")!.innerHTML)).to.equal(
      "<p>foo</p>"
    );

    render(app("bar"), container);
    expect(stripComments(container.querySelector("div")!.innerHTML)).to.equal(
      "<p>bar</p>"
    );
  });

  it("template array with key", () => {
    const app = (items: any) => html`
      <ul>
        ${items.map(
          (item: any) => html`
            <li :key=${item.id}>${item.content}</li>
          `
        )}
      </ul>
    `;

    render(
      app([
        { id: 1, content: "aaa" },
        { id: 2, content: "bbb" },
        { id: 3, content: "ccc" },
        { id: 4, content: "ddd" },
        { id: 5, content: "eee" }
      ]),
      container
    );

    const [li1_1, li1_2, li1_3, li1_4, li1_5] = container
      .querySelector("ul")!
      .querySelectorAll("li");

    expect(li1_1.innerText).to.equal("aaa");
    expect(li1_2.innerText).to.equal("bbb");
    expect(li1_3.innerText).to.equal("ccc");
    expect(li1_4.innerText).to.equal("ddd");
    expect(li1_5.innerText).to.equal("eee");

    // insert
    render(
      app([
        { id: 8, content: "hhh" },
        { id: 1, content: "aaa" },
        { id: 2, content: "bbb" },
        { id: 3, content: "ccc" },
        { id: 6, content: "fff" },
        { id: 4, content: "ddd" },
        { id: 5, content: "eee" },
        { id: 7, content: "ggg" }
      ]),
      container
    );
    const [
      li2_8,
      li2_1,
      li2_2,
      li2_3,
      li2_6,
      li2_4,
      li2_5,
      li2_7
    ] = container.querySelector("ul")!.querySelectorAll("li");

    expect(li2_8.innerText).to.equal("hhh");
    expect(li2_1.innerText).to.equal("aaa");
    expect(li2_2.innerText).to.equal("bbb");
    expect(li2_3.innerText).to.equal("ccc");
    expect(li2_6.innerText).to.equal("fff");
    expect(li2_4.innerText).to.equal("ddd");
    expect(li2_5.innerText).to.equal("eee");
    expect(li2_7.innerText).to.equal("ggg");

    expect(li2_1).to.equal(li1_1);
    expect(li2_2).to.equal(li1_2);
    expect(li2_3).to.equal(li1_3);
    expect(li2_4).to.equal(li1_4);
    expect(li2_5).to.equal(li1_5);

    // delete
    render(
      app([
        { id: 8, content: "hhh" },
        { id: 6, content: "fff" },
        { id: 4, content: "ddd" },
        { id: 5, content: "eee" }
      ]),
      container
    );
    const [li3_8, li3_6, li3_4, li3_5] = container
      .querySelector("ul")!
      .querySelectorAll("li");

    expect(li3_8.innerText).to.equal("hhh");
    expect(li3_6.innerText).to.equal("fff");
    expect(li3_4.innerText).to.equal("ddd");
    expect(li3_5.innerText).to.equal("eee");

    expect(li3_8).to.equal(li2_8);
    expect(li3_6).to.equal(li2_6);
    expect(li3_4).to.equal(li2_4);
    expect(li3_5).to.equal(li2_5);

    // delete and insert
    render(
      app([
        { id: 8, content: "hhh" },
        { id: 4, content: "ddd" },
        { id: 9, content: "iii" },
        { id: 5, content: "eee" },
        { id: 10, content: "jjj" }
      ]),
      container
    );
    const [li4_8, li4_4, li4_9, li4_5, li4_10] = container
      .querySelector("ul")!
      .querySelectorAll("li");

    expect(li4_8.innerText).to.equal("hhh");
    expect(li4_4.innerText).to.equal("ddd");
    expect(li4_9.innerText).to.equal("iii");
    expect(li4_5.innerText).to.equal("eee");
    expect(li4_10.innerText).to.equal("jjj");

    expect(li4_8).to.equal(li3_8);
    expect(li4_4).to.equal(li3_4);
    expect(li4_5).to.equal(li3_5);
  });

  it("template array without key", () => {
    const app = (items: any) => html`
      <ul>
        ${items.map(
          (item: any) => html`
            <li>${item.content}</li>
          `
        )}
      </ul>
    `;

    render(
      app([
        { id: 1, content: "aaa" },
        { id: 2, content: "bbb" },
        { id: 3, content: "ccc" },
        { id: 4, content: "ddd" },
        { id: 5, content: "eee" }
      ]),
      container
    );

    const [li1_1, li1_2, li1_3, li1_4, li1_5] = container
      .querySelector("ul")!
      .querySelectorAll("li");

    expect(li1_1.innerText).to.equal("aaa");
    expect(li1_2.innerText).to.equal("bbb");
    expect(li1_3.innerText).to.equal("ccc");
    expect(li1_4.innerText).to.equal("ddd");
    expect(li1_5.innerText).to.equal("eee");

    // insert
    render(
      app([
        { id: 8, content: "hhh" },
        { id: 1, content: "aaa" },
        { id: 2, content: "bbb" },
        { id: 3, content: "ccc" },
        { id: 6, content: "fff" },
        { id: 4, content: "ddd" },
        { id: 5, content: "eee" },
        { id: 7, content: "ggg" }
      ]),
      container
    );
    const [
      li2_8,
      li2_1,
      li2_2,
      li2_3,
      li2_6,
      li2_4,
      li2_5,
      li2_7
    ] = container.querySelector("ul")!.querySelectorAll("li");

    expect(li2_8.innerText).to.equal("hhh");
    expect(li2_1.innerText).to.equal("aaa");
    expect(li2_2.innerText).to.equal("bbb");
    expect(li2_3.innerText).to.equal("ccc");
    expect(li2_6.innerText).to.equal("fff");
    expect(li2_4.innerText).to.equal("ddd");
    expect(li2_5.innerText).to.equal("eee");
    expect(li2_7.innerText).to.equal("ggg");

    expect(li2_8).to.equal(li1_1);
    expect(li2_1).to.equal(li1_2);
    expect(li2_2).to.equal(li1_3);
    expect(li2_3).to.equal(li1_4);
    expect(li2_6).to.equal(li1_5);

    // delete
    render(
      app([
        { id: 8, content: "hhh" },
        { id: 6, content: "fff" },
        { id: 4, content: "ddd" },
        { id: 5, content: "eee" }
      ]),
      container
    );
    const [li3_8, li3_6, li3_4, li3_5] = container
      .querySelector("ul")!
      .querySelectorAll("li");

    expect(li3_8.innerText).to.equal("hhh");
    expect(li3_6.innerText).to.equal("fff");
    expect(li3_4.innerText).to.equal("ddd");
    expect(li3_5.innerText).to.equal("eee");

    expect(li3_8).to.equal(li2_8);
    expect(li3_6).to.equal(li2_1);
    expect(li3_4).to.equal(li2_2);
    expect(li3_5).to.equal(li2_3);

    // delete and insert
    render(
      app([
        { id: 8, content: "hhh" },
        { id: 4, content: "ddd" },
        { id: 9, content: "iii" },
        { id: 5, content: "eee" },
        { id: 10, content: "jjj" }
      ]),
      container
    );
    const [li4_8, li4_4, li4_9, li4_5, li4_10] = container
      .querySelector("ul")!
      .querySelectorAll("li");

    expect(li4_8.innerText).to.equal("hhh");
    expect(li4_4.innerText).to.equal("ddd");
    expect(li4_9.innerText).to.equal("iii");
    expect(li4_5.innerText).to.equal("eee");
    expect(li4_10.innerText).to.equal("jjj");

    expect(li4_8).to.equal(li3_8);
    expect(li4_4).to.equal(li3_6);
    expect(li4_9).to.equal(li3_4);
    expect(li4_5).to.equal(li3_5);
  });

  it("attribute", () => {
    const app = (
      name: string,
      bool: boolean,
      value: unknown,
      onclick: Function
    ) => html`
      <div name=${name} ?bool=${bool} .value=${value} @click=${onclick}>
        attributes
      </div>
    `;

    const cb1 = sinon.spy();
    render(app("Alice", false, 100, cb1), container);
    const div = container.querySelector("div")! as HTMLDivElement & {
      value: unknown;
    };
    div.click();

    expect(div.getAttribute("name")).to.equal("Alice");
    expect(div.hasAttribute("bool")).to.equal(false);
    expect(div.value).to.equal(100);
    expect(cb1.calledOnce).to.be.true;

    const cb2 = sinon.spy();
    render(app("Bob", true, 200, cb2), container);
    div.click();

    expect(div.getAttribute("name")).to.equal("Bob");
    expect(div.hasAttribute("bool")).to.equal(true);
    expect(div.value).to.equal(200);
    expect(cb2.calledOnce).to.be.true;
    expect(cb1.calledOnce).to.be.true;
  });

  it("spread attribute", () => {
    const app = (props: unknown) => html`
      <div ...${props}>
        attributes
      </div>
    `;

    const cb1 = sinon.spy();
    render(
      app({ name: "Alice", "?bool": true, ".value": 100, "@click": cb1 }),
      container
    );
    const div = container.querySelector("div")! as HTMLDivElement & {
      value: unknown;
    };
    div.click();

    expect(div.getAttribute("name")).to.equal("Alice");
    expect(div.hasAttribute("bool")).to.equal(true);
    expect(div.value).to.equal(100);
    expect(cb1.calledOnce).to.be.true;

    const cb2 = sinon.spy();
    render(
      app({ name: "Bob", "?bool": false, ".value": 200, "@click": cb2 }),
      container
    );
    div.click();

    expect(div.getAttribute("name")).to.equal("Bob");
    expect(div.hasAttribute("bool")).to.equal(false);
    expect(div.value).to.equal(200);
    expect(cb2.calledOnce).to.be.true;
    expect(cb1.calledOnce).to.be.true;
  });

  it("unsafe html", () => {
    const app = () => html`
      <div .innerHTML=${"<span>unsafe</span>"}>
        ignored
      </div>
    `;
    render(app(), container);
    const span1 = container.querySelector("div")!.querySelector("span")!;
    expect(span1.innerText).to.equal("unsafe");

    render(app(), container);
    const span2 = container.querySelector("div")!.querySelector("span")!;
    expect(span2.innerText).to.equal("unsafe");
    expect(span2).to.equal(span1);
  });

  it("text -> template", () => {
    render("the text", container);
    expect(container.innerText).to.equal("the text");

    render(
      html`
        the template
      `,
      container
    );
    expect(container.innerText).to.equal("the template");
  });

  it("template -> text", () => {
    render(
      html`
        the template
      `,
      container
    );
    expect(container.innerText).to.equal("the template");

    render("the text", container);
    expect(container.innerText).to.equal("the text");
  });

  it("template - another template", () => {
    render(
      html`
        <div>first</div>
      `,
      container
    );
    expect(stripComments(container.innerHTML)).to.equal("<div>first</div>");
    render(
      html`
        <section>second</section>
      `,
      container
    );
    expect(stripComments(container.innerHTML)).to.equal(
      "<section>second</section>"
    );
  });

  it("default value of <select>", () => {
    const app = (selectValue: string) => html`
      <select .value=${selectValue}>
        ${["a", "b", "c"].map(
          v => html`
            <option value=${v}>${v}</option>
          `
        )}
      </select>
      ${"dummy"}
    `;

    render(app("c"), container);
    expect(container.querySelector("select")!.value).to.be.equal("c");

    render(app("a"), container);
    expect(container.querySelector("select")!.value).to.be.equal("a");
  });

  it(":style attribute", () => {
    const app = (
      style: Partial<{ [name in keyof CSSStyleDeclaration]: string }> | null
    ) => html`
      <div :style=${style}></div>
    `;
    render(app({ color: "red", backgroundColor: "grey" }), container);
    const div = container.querySelector("div");
    expect(div?.style.color).to.equal("red");
    expect(div?.style.backgroundColor).to.equal("grey");

    render(app({ color: "blue", fontWeight: "bold" }), container);
    expect(div?.style.color).to.equal("blue");
    expect(div?.style.backgroundColor).to.be.empty;
    expect(div?.style.fontWeight).to.equal("bold");

    render(app(null), container);
    expect(div?.style.color).to.be.empty;
    expect(div?.style.backgroundColor).to.be.empty;
    expect(div?.style.fontWeight).to.be.empty;
  });

  it(":class attribute", () => {
    const app = (classes: string[] | object | null) => html`
      <div :class=${classes}></div>
    `;
    render(app(["foo", "bar"]), container);
    const div = container.querySelector("div");
    expect(div?.classList.contains("foo")).to.be.true;
    expect(div?.classList.contains("bar")).to.be.true;

    render(app(["foo", "baz"]), container);
    expect(div?.classList.contains("foo")).to.be.true;
    expect(div?.classList.contains("bar")).to.be.false;
    expect(div?.classList.contains("baz")).to.be.true;

    // array -> object
    render(app({ hey: true, foo: true, bar: false }), container);
    expect(div?.classList.contains("foo")).to.be.true;
    expect(div?.classList.contains("hey")).to.be.true;
    expect(div?.classList.contains("baz")).to.be.false;

    // array -> null
    render(app(["foo", "baz"]), container);
    render(app(null), container);
    expect(div?.classList.contains("foo")).to.be.false;
    expect(div?.classList.contains("hey")).to.be.false;
    expect(div?.classList.contains("baz")).to.be.false;

    // null -> object
    render(app({ foo: true, bar: false, baz: true }), container);
    expect(div?.classList.contains("foo")).to.be.true;
    expect(div?.classList.contains("bar")).to.be.false;
    expect(div?.classList.contains("baz")).to.be.true;

    render(app({ foo: false, bar: true }), container);
    expect(div?.classList.contains("foo")).to.be.false;
    expect(div?.classList.contains("bar")).to.be.true;
    expect(div?.classList.contains("baz")).to.be.false;

    render(app(null), container);
    expect(div?.classList.contains("foo")).to.be.false;
    expect(div?.classList.contains("bar")).to.be.false;
    expect(div?.classList.contains("baz")).to.be.false;
  });
});
