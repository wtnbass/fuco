import { expect } from "chai";
import { renderToString } from "..";
import { html } from "../../html";

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
      >
        Hello
      </div>
    `);
    expect(s).to.equal(`<div name="a" baz novalue="">Hello</div>`);
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
});
