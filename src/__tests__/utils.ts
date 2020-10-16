export function stripComments(html: string) {
  return html.replace(/<!---->/g, "");
}

export function series(html: string) {
  return html.replace(/\s*\n\s*/g, "");
}
