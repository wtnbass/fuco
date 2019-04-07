export function mountFixture(html: string) {
  const fixture = document.createElement("div");
  fixture.id = "fixture";
  fixture.innerHTML = html;
  document.body.appendChild(fixture);
}

export function unmountFixture() {
  const fixture = document.getElementById("fixture");
  document.body.removeChild(fixture);
}

export function selectFixture(selector: string) {
  const fixture = document.getElementById("fixture");
  return fixture.querySelector(selector);
}

export function waitFor() {
  return new Promise(resolve => setTimeout(resolve));
}
