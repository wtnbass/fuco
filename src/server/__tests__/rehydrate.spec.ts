import { expect } from "chai";
import { rehydrateScript } from "../rehydrate";
import { __def__, defineElement } from "../../fuco";

describe("rehydrate", () => {
  afterEach(() => {
    for (const key in __def__) delete __def__[key];
  });

  const scriptStatics =
    "var e=function(a,c){for(var i=0;i<a.length;i++)c(a[i])}," +
    "d=function(a){a&&a.parentNode.removeChild(a)}," +
    "r=function(n){return function(){" +
    "var s=document.querySelectorAll(n);" +
    "e(s,function(a){e(a.querySelectorAll('shadowroot'),function(b){" +
    "e(b,function(c){e(c.querySelectorAll('slot'),function(d){s.appendChild(d)})});d(b)})});" +
    "d(__ssr__)" +
    "};};";

  const whenDefinedScript = (name: string) =>
    `customElements.whenDefined("${name}").then(r("${name}"));`;

  const scriptString = (str: string) =>
    `<script>var __ssr__=document.currentScript;(function(){${scriptStatics}${str}}())</script>`;

  it("no define element", () => {
    expect(rehydrateScript()).to.equal(scriptString(""));
  });

  it("single define element", () => {
    defineElement("a-1", () => "");
    expect(rehydrateScript()).to.equal(scriptString(whenDefinedScript("a-1")));
  });

  it("multiple define element", () => {
    defineElement("a-1", () => "");
    defineElement("a-2", () => "");
    defineElement("a-3", () => "");
    defineElement("a-4", () => "");
    expect(rehydrateScript()).to.equal(
      scriptString(
        whenDefinedScript("a-1") +
          whenDefinedScript("a-2") +
          whenDefinedScript("a-3") +
          whenDefinedScript("a-4")
      )
    );
  });
});
