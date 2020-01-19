import { __FucoRegistry__ } from "../fuco";

export function rehydrateScript() {
  let scripts = "";

  scripts += "var e=function(a,c){for(var i=0;i<a.length;i++)c(a[i])},";
  scripts += "d=function(a){a&&a.parentNode.removeChild(a)},";
  scripts +=
    "r=function(n){return function(){" +
    "var s=document.querySelectorAll(n);" +
    "e(s,function(a){e(a.querySelectorAll('shadowroot'),function(b){" +
    "e(b,function(c){e(c.querySelectorAll('slot'),function(d){s.appendChild(d)})});d(b)})});" +
    "d(__ssr__)" +
    "};};";

  for (const elementName in __FucoRegistry__) {
    scripts += `customElements.whenDefined("${elementName}").then(r("${elementName}"));`;
  }

  return `<script>var __ssr__=document.currentScript;(function(){${scripts}}())</script>`;
}
