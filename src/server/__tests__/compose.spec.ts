import { expect } from "chai";
import { renderToString } from "..";
import { html } from "../../html";
import { defineElement } from "../../core";
import { Registry } from "../../core/define-element";

describe("compose", () => {
  afterEach(() => {
    for (const key in Registry) delete Registry[key];
  });

  it("simple component", () => {
    defineElement(
      "test-element",
      () => html`
        <div>fuco element</div>
      `
    );

    const s = renderToString(html`
      <test-element></test-element>
    `);

    expect(s).to.equal(
      "<test-element>" +
        '<template shadow-root="">' +
        "<div>fuco element</div>" +
        "</template>" +
        "</test-element>"
    );
  });

  it("nested", () => {
    defineElement(
      "test-1",
      () => html`
        <test-2></test-2>
      `
    );
    defineElement(
      "test-2",
      () =>
        html`
          <div>test</div>
        `
    );

    const s = renderToString(html`
      <test-1></test-1>
    `);

    expect(s).to.equal(
      "<test-1>" +
        '<template shadow-root="">' +
        "<test-2>" +
        '<template shadow-root="">' +
        "<div>test</div>" +
        "</template>" +
        "</test-2>" +
        "</template>" +
        "</test-1>"
    );
  });

  it("slot", () => {
    defineElement(
      "test-slot",
      () => html`
        <div>Hello, <slot></slot></div>
      `
    );

    const s = renderToString(html`
      <test-slot>World</test-slot>
    `);

    expect(s).to.equal(
      "<test-slot>" +
        '<template shadow-root="">' +
        "<div>Hello, <slot>World</slot></div>" +
        "</template>" +
        "</test-slot>"
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
      "<test-slot>" +
        '<template shadow-root="">' +
        '<header><slot name="header">' +
        '<div slot="header">Header</div>' +
        "</slot></header>" +
        '<footer><slot name="footer">' +
        '<div slot="footer">Footer</div>' +
        "</slot></footer>" +
        "</template>" +
        "</test-slot>"
    );
  });
});
