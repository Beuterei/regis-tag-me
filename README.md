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
  - [transformBoolean](#transformboolean)
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
    transformBoolean,
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
            {showGreeting && <span>Hello</span>} {firstName} from{" "}
            {element.tagName}
        </div>
    );
};

registerWebComponent("my-custom-element", MyCustomElement, {
    firstName: z.string().default("Guest"),
    showGreeting: z.string().transform(transformBoolean),
});
```

Use the custom tag in your HTML:

```html
<!-- Result: Hello John from MY-CUSTOM-ELEMENT -->
<my-custom-element first-name="John" show-greeting />
```

### registerWebComponent

Registers a React component as a Web Component (Custom Element) using the given tag name. Takes [registerWebComponent](#registerwebcomponent) as arguments.

### transformBoolean

Helper to parse booleans correctly if passed by attributes.

### useWebComponentContext

Provides a context for the web component. Returns [WebComponentContext](#webcomponentcontext).

## Interfaces

### registerWebComponent

- `tagName` - The name of the custom element
- `Component` - The React component to render inside the web component
- `attributeSchema` - [StandardSchemaV1](https://github.com/standard-schema/standard-schema) defining the attributes/props for the component
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
