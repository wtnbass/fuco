import { html, defineElement, useProperty } from "../../src";
import { User } from "./input-user";

function UserInfo() {
  const user: User = useProperty("user");
  return html`
    ${user.name} (${user.age})
  `;
}

defineElement("user-info", UserInfo);
