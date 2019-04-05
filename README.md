# functional-web-component

[![npm](https://img.shields.io/npm/v/functional-web-component.svg)](https://www.npmjs.com/package/functional-web-component)

WebComponents with lit-html and Hooks.

## Example

You can use it without any build or tools.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Counter</title>
  <head>
  <body>
    <counter-app></counter-app>
    <script type="module">
      import { html, defineElement, useState } from 'https://unpkg.com/functional-web-component?module';

      function Counter() {
        const [count, setCount] = useState(0);
        return html`
          <div>${count}</div>
          <button @click=${() => setCount(count + 1)}>+</button>
          <button @click=${() => setCount(count - 1)}>-</button>
        `;
      }

      defineElement("counter-app", Counter);
    </script>
  </body>
</html>
```
