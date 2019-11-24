/* eslint-disable
  @typescript-eslint/no-non-null-assertion,
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/camelcase
*/
import { html, render } from "../..";

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
    expect(container.querySelector("div")!.innerText).toEqual("string");

    render(app("change"), container);
    expect(container.querySelector("div")!.innerText).toEqual("change");

    render(app(1000), container);
    expect(container.querySelector("div")!.innerText).toEqual("1000");

    render(app(true), container);
    expect(container.querySelector("div")!.innerText).toEqual("true");

    render(app(false), container);
    expect(container.querySelector("div")!.innerText).toEqual("false");
  });

  it("text array", () => {
    const app = (...args: any[]) => html`
      <div>${args}</div>
    `;

    // first
    render(app("a", "b", "c"), container);
    expect(container.querySelector("div")!.innerText).toEqual("abc");

    // change
    render(app("d", "e", "f"), container);
    expect(container.querySelector("div")!.innerText).toEqual("def");

    // add
    render(app("d", "e", "f", "g", "h"), container);
    expect(container.querySelector("div")!.innerText).toEqual("defgh");

    // remove
    render(app("e", "f", "g"), container);
    expect(container.querySelector("div")!.innerText).toEqual("efg");

    // remove and insert
    render(app("z", "e", "g", "a", "b"), container);
    expect(container.querySelector("div")!.innerText).toEqual("zegab");
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
    expect(container.querySelector("div")!.innerHTML).toEqual(
      "<!----><p>foo<!----></p><!----><!---->"
    );

    render(app("bar"), container);
    expect(container.querySelector("div")!.innerHTML).toEqual(
      "<!----><p>bar<!----></p><!----><!---->"
    );
  });

  it("template array with key", () => {
    const app = (items: any) => html`
      <ul>
        ${items.map(
          (item: any) => html`
            <li key=${item.id}>${item.content}</li>
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

    expect(li1_1.innerText).toEqual("aaa");
    expect(li1_2.innerText).toEqual("bbb");
    expect(li1_3.innerText).toEqual("ccc");
    expect(li1_4.innerText).toEqual("ddd");
    expect(li1_5.innerText).toEqual("eee");

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

    expect(li2_8.innerText).toEqual("hhh");
    expect(li2_1.innerText).toEqual("aaa");
    expect(li2_2.innerText).toEqual("bbb");
    expect(li2_3.innerText).toEqual("ccc");
    expect(li2_6.innerText).toEqual("fff");
    expect(li2_4.innerText).toEqual("ddd");
    expect(li2_5.innerText).toEqual("eee");
    expect(li2_7.innerText).toEqual("ggg");

    expect(li2_1).toEqual(li1_1);
    expect(li2_2).toEqual(li1_2);
    expect(li2_3).toEqual(li1_3);
    expect(li2_4).toEqual(li1_4);
    expect(li2_5).toEqual(li1_5);

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

    expect(li3_8.innerText).toEqual("hhh");
    expect(li3_6.innerText).toEqual("fff");
    expect(li3_4.innerText).toEqual("ddd");
    expect(li3_5.innerText).toEqual("eee");

    expect(li3_8).toEqual(li2_8);
    expect(li3_6).toEqual(li2_6);
    expect(li3_4).toEqual(li2_4);
    expect(li3_5).toEqual(li2_5);

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

    expect(li4_8.innerText).toEqual("hhh");
    expect(li4_4.innerText).toEqual("ddd");
    expect(li4_9.innerText).toEqual("iii");
    expect(li4_5.innerText).toEqual("eee");
    expect(li4_10.innerText).toEqual("jjj");

    expect(li4_8).toEqual(li3_8);
    expect(li4_4).toEqual(li3_4);
    expect(li4_5).toEqual(li3_5);
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

    expect(li1_1.innerText).toEqual("aaa");
    expect(li1_2.innerText).toEqual("bbb");
    expect(li1_3.innerText).toEqual("ccc");
    expect(li1_4.innerText).toEqual("ddd");
    expect(li1_5.innerText).toEqual("eee");

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

    expect(li2_8.innerText).toEqual("hhh");
    expect(li2_1.innerText).toEqual("aaa");
    expect(li2_2.innerText).toEqual("bbb");
    expect(li2_3.innerText).toEqual("ccc");
    expect(li2_6.innerText).toEqual("fff");
    expect(li2_4.innerText).toEqual("ddd");
    expect(li2_5.innerText).toEqual("eee");
    expect(li2_7.innerText).toEqual("ggg");

    expect(li2_8).toEqual(li1_1);
    expect(li2_1).toEqual(li1_2);
    expect(li2_2).toEqual(li1_3);
    expect(li2_3).toEqual(li1_4);
    expect(li2_6).toEqual(li1_5);

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

    expect(li3_8.innerText).toEqual("hhh");
    expect(li3_6.innerText).toEqual("fff");
    expect(li3_4.innerText).toEqual("ddd");
    expect(li3_5.innerText).toEqual("eee");

    expect(li3_8).toEqual(li2_8);
    expect(li3_6).toEqual(li2_1);
    expect(li3_4).toEqual(li2_2);
    expect(li3_5).toEqual(li2_3);

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

    expect(li4_8.innerText).toEqual("hhh");
    expect(li4_4.innerText).toEqual("ddd");
    expect(li4_9.innerText).toEqual("iii");
    expect(li4_5.innerText).toEqual("eee");
    expect(li4_10.innerText).toEqual("jjj");

    expect(li4_8).toEqual(li3_8);
    expect(li4_4).toEqual(li3_6);
    expect(li4_9).toEqual(li3_4);
    expect(li4_5).toEqual(li3_5);
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

    const cb1 = jasmine.createSpy();
    render(app("Alice", false, 100, cb1), container);
    const div = container.querySelector("div")! as HTMLDivElement & {
      value: unknown;
    };
    div.click();

    expect(div.getAttribute("name")).toEqual("Alice");
    expect(div.hasAttribute("bool")).toEqual(false);
    expect(div.value).toEqual(100);
    expect(cb1).toHaveBeenCalled();

    const cb2 = jasmine.createSpy();
    render(app("Bob", true, 200, cb2), container);
    div.click();

    expect(div.getAttribute("name")).toEqual("Bob");
    expect(div.hasAttribute("bool")).toEqual(true);
    expect(div.value).toEqual(200);
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb1).toHaveBeenCalledTimes(1);
  });

  it("spread attribute", () => {
    const app = (props: unknown) => html`
      <div ...${props}>
        attributes
      </div>
    `;

    const cb1 = jasmine.createSpy();
    render(
      app({ name: "Alice", "?bool": true, ".value": 100, "@click": cb1 }),
      container
    );
    const div = container.querySelector("div")! as HTMLDivElement & {
      value: unknown;
    };
    div.click();

    expect(div.getAttribute("name")).toEqual("Alice");
    expect(div.hasAttribute("bool")).toEqual(true);
    expect(div.value).toEqual(100);
    expect(cb1).toHaveBeenCalled();

    const cb2 = jasmine.createSpy();
    render(
      app({ name: "Bob", "?bool": false, ".value": 200, "@click": cb2 }),
      container
    );
    div.click();

    expect(div.getAttribute("name")).toEqual("Bob");
    expect(div.hasAttribute("bool")).toEqual(false);
    expect(div.value).toEqual(200);
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb1).toHaveBeenCalledTimes(1);
  });

  it("unsafe html", () => {
    const app = () => html`
      <div unsafe-html=${"<span>unsafe</span>"}>
        ignored
      </div>
    `;
    render(app(), container);
    const span1 = container.querySelector("div")!.querySelector("span")!;
    expect(span1.innerText).toEqual("unsafe");

    render(app(), container);
    const span2 = container.querySelector("div")!.querySelector("span")!;
    expect(span2.innerText).toEqual("unsafe");
    expect(span2).toEqual(span1);
  });

  it("text -> template", () => {
    render("the text", container);
    expect(container.innerText).toEqual("the text");

    render(
      html`
        the template
      `,
      container
    );
    expect(container.innerText).toEqual("the template");
  });

  it("template -> text", () => {
    render(
      html`
        the template
      `,
      container
    );
    expect(container.innerText).toEqual("the template");

    render("the text", container);
    expect(container.innerText).toEqual("the text");
  });

  it("template - another template", () => {
    render(
      html`
        <div>first</div>
      `,
      container
    );
    expect(container.innerHTML.replace(/<!---->/g, "")).toEqual(
      "<div>first</div>"
    );
    render(
      html`
        <section>second</section>
      `,
      container
    );
    expect(container.innerHTML.replace(/<!---->/g, "")).toEqual(
      "<section>second</section>"
    );
  });
});
