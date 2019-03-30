import { html, defineElement, useProperty } from "../lib";

export interface User {
  name: string;
  age: number;
}
function UserInfo() {
  const user: User = useProperty("user");
  return html`
    ${user.name} (${user.age})
  `;
}

defineElement("user-info", UserInfo);
