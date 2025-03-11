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
- [Interfaces](#interfaces)
    - [registerWebComponent](#registerwebcomponent-1)
    - [WebComponentContext](#webcomponentcontext)

<!-- ABOUT THE PROJECT -->

## About The Project

Defines react based custom elements and validates the attributes.

### Installation

```bash
npm i -D @beuluis/regis-tag-me
```

## Usage

```tsx
import {
    useWebComponentContext,
    registerWebComponent,
} from "@beuluis/regis-tag-me";
import { z } from "zod";

const MyCustomElement = ({ firstName }: { firstName: string }) => {
    const { containerElement, element, hasShadowDom, stylesContainer } =
        useWebComponentContext();

    return (
        <div>
            Hello {firstName} from {element.tagName}
        </div>
    );
};

registerWebComponent(
    "my-custom-element",
    MyCustomElement,
    z.object({
        firstName: z.string().default("Guest"),
    }),
);
```

Use the custom tag in your HTML:

```html
<!-- Result: Hello John from MY-CUSTOM-ELEMENT -->
<my-custom-element first-name="John" />
```

### registerWebComponent

Registers a React component as a Web Component (Custom Element) using the given tag name. Takes [registerWebComponent](#registerwebcomponent) as arguments.

### useWebComponentContext

Provides a context for the web component. Returns [WebComponentContext](#webcomponentcontext).

## Interfaces

### registerWebComponent

- `tagName` - The name of the custom element
- `Component` - The React component to render inside the web component
- `attributeSchema` - [Zod schema](https://zod.dev/) defining the attributes/props for the component with automatic type conversion for primitives (string, number, boolean, etc.)
- `options` - Additional configuration options
    - `mixin` - Optional mixin to extend the web component's functionality
    - `shadowDOM` - Controls whether to use Shadow DOM
        - If boolean: directly determines Shadow DOM usage
        - If function: dynamically determines Shadow DOM usage based on attributes

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
