import { expect } from "chai";
import { renderToString } from "..";
import { html } from "../../html";
import { defineElement } from "../../fuco";
import { rehydrateScript } from "../rehydrate";

describe("render-to-string", () => {
  it("simple", () => {
    const s = renderToString(html`
      <div>Hello</div>
    `);
    expect(s).to.equal(`<div>Hello</div>`);
  });

  it("slash element", () => {
    const s = renderToString(html`
      <div />
    `);
    expect(s).to.equal(`<div></div>`);
  });

  it("void element", () => {
    const s = renderToString(html`
      <input />
    `);
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
    const s = renderToString(html`
      <div :class=${["foo", "bar"]}>
        Hello
      </div>
    `);
    expect(s).to.equal(`<div class="foo bar">Hello</div>`);
  });

  it("class object", () => {
    const s = renderToString(html`
      <div :class=${{ foo: true, bar: false }}>
        Hello
      </div>
    `);
    expect(s).to.equal(`<div class="foo">Hello</div>`);
  });

  it("style object", () => {
    const s = renderToString(html`
      <div :style=${{ color: "red", backgroundColor: "grey" }}>
        Hello
      </div>
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
      ["a", "b", "c"].map(
        v => html`
          <div>${v}</div>
        `
      )
    );
    expect(s).to.equal(`<div>a</div><div>b</div><div>c</div>`);
  });

  it("select", () => {
    const s = renderToString(html`
      <select .value=${"b"}>
        ${["a", "b", "c"].map(
          v => html`
            <option value=${v}>${v}</option>
          `
        )}
      </select>
    `);
    expect(s).to.equal(
      `<select>` +
        `<option value="a">a</option>` +
        `<option value="b" selected>b</option>` +
        `<option value="c">c</option>` +
        `</select>`
    );
  });

  it("with rehydrate", () => {
    defineElement(
      "ssr-app",
      () => html`
        <div>ssr</div>
      `
    );
    const s = renderToString(
      html`
        <ssr-app></ssr-app>
      `,
      { hydrate: true }
    );
    expect(s).to.include(rehydrateScript());
  });
});
