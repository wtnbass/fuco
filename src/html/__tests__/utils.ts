export function stripComments(html: string) {
  return html.replace(/<!---->/g, "");
}
