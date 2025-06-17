[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<br />
<p align="center">
  <img src="https://web-components-resources.appspot.com/static/logo.svg" alt="Logo" height="60">

  <h3 align="center">regis-tag-me</h3>

  <p align="center">
    Web Components with react
    <br />
    <br />
    ·
    <a href="https://github.com/Beuterei/regis-tag-me/issues">Report Bug</a>
    ·
    <a href="https://github.com/Beuterei/regis-tag-me/issues">Request Feature</a>
    ·
  </p>
</p>

- [About The Project](#about-the-project)
    - [Installation](#installation)
- [Usage](#usage)
    - [registerWebComponent](#registerwebcomponent)
    - [useWebComponentContext](#usewebcomponentcontext)
    - [attributeBoolean](#attributeboolean)
- [Interfaces](#interfaces)
    - [registerWebComponent](#registerwebcomponent-1)
    - [WebComponentContext](#webcomponentcontext)

<!-- ABOUT THE PROJECT -->

## About The Project

Defines react based custom elements and validates the attributes.

### Installation

```bash
npm i @beuluis/regis-tag-me zod
```

## Usage

```tsx
import {
    attributeBoolean,
    useWebComponentContext,
    registerWebComponent,
} from "@beuluis/regis-tag-me";
import { z } from "zod";

const MyCustomElement = ({
    firstName,
    showGreeting = true,
}: {
    firstName: string;
    showGreeting: boolean;
}) => {
    const { containerElement, element, hasShadowDom, stylesContainer } =
        useWebComponentContext();

    return (
        <div>
            Hello {firstName} from {element.tagName}. I am{" "}
            {hasShadowDom ? "" : "not"} rendered in a shadow DOM.
        </div>
    );
};

registerWebComponent(
    "my-custom-element",
    MyCustomElement,
    z.interface({
        firstName: z.string().default("Guest"),
        useShadow: attributeBoolean,
    }),
    {
        shadowDOM: ({ useShadow }) => useShadow,
    },
);
```

Use the custom tag in your HTML:

```html
<html>
    <head>
        <script src="yourBundle.js"></script>
    </head>
    <body>
        <!-- Result: Hello John from MY-CUSTOM-ELEMENT. I am rendered in a shadow DOM. -->
        <my-custom-element first-name="John" use-shadow />
        <!-- Result: Hello John from MY-CUSTOM-ELEMENT. I am not rendered in a shadow DOM. -->
        <my-custom-element first-name="John" />
    </body>
</html>
```

### registerWebComponent

Registers a React component as a Web Component (Custom Element) using the given tag name. Takes [registerWebComponent](#registerwebcomponent) as arguments.

### useWebComponentContext

Provides a context for the web component. Returns [WebComponentContext](#webcomponentcontext).

### attributeBoolean

Booleans based on attributes can be tricky.

To help with this this library exports `attributeBoolean` which is a pre-configured schema that parses attribute based booleans correctly.

Example:

```html
<!-- Result: true -->
<my-custom-element this-is-a-bool />
<!-- Result: true -->
<my-custom-element this-is-a-bool="true" />
<!-- Result: false -->
<my-custom-element this-is-a-bool="false" />
<!-- Result: false -->
<my-custom-element />
```

If this parsing is not wanted or desired you can checkout [Zod´s stringbool](https://zod.dev/api?id=stringbool)

## Interfaces

### registerWebComponent

- `tagName` - The name of the custom element
- `Component` - The React component to render inside the web component
- `attributeSchema` - [Zod 4 or Zod 4-mini object schema](https://zod.dev/v4) defining the attributes/props for the component
- `options` - Additional configuration options
    - `mixin` - Optional mixin to extend the web component's functionality. Runs after this library's logic
    - `shadowDOM` - Controls whether to use Shadow DOM
        - If boolean: directly determines Shadow DOM usage
        - If function: dynamically determines Shadow DOM usage based on attributes. This only takes effect on the first render

### WebComponentContext

- `containerElement` - The element to mount the web component in
- `element` - The web component element
- `hasShadowDom` - Whether the web component uses Shadow DOM
- `stylesContainer` - The element to mount custom styles in

[contributors-shield]: https://img.shields.io/github/contributors/Beuterei/regis-tag-me.svg?style=flat-square
[contributors-url]: https://github.com/Beuterei/regis-tag-me/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Beuterei/regis-tag-me.svg?style=flat-square
[forks-url]: https://github.com/Beuterei/regis-tag-me/network/members
[stars-shield]: https://img.shields.io/github/stars/Beuterei/regis-tag-me.svg?style=flat-square
[stars-url]: https://github.com/Beuterei/regis-tag-me/stargazers
[issues-shield]: https://img.shields.io/github/issues/Beuterei/regis-tag-me.svg?style=flat-square
[issues-url]: https://github.com/Beuterei/regis-tag-me/issues
[license-shield]: https://img.shields.io/github/license/Beuterei/regis-tag-me.svg?style=flat-square
