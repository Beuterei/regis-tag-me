import { WebComponentContextProvider } from '../context/webComponentContext';
import { toKebabCase } from '../utility/helper';
import { type FC } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { type z } from 'zod';

// Mixin may define same handle methods as other custom element constructors. So we need to call them when they are defined.
type Mixin = (constructor: CustomElementConstructor) => new () => HTMLElement & {
    /* eslint-disable @typescript-eslint/method-signature-style */
    attributeChangedCallback?(name: string, oldValue: string, newValue: string): void;
    connectedCallback?(): void;
    disconnectedCallback?(): void;
    /* eslint-enable @typescript-eslint/method-signature-style */
};

/**
 * Registers a React component as a Web Component (Custom Element)
 * @param tagName - The HTML tag name to register the component as (must contain a hyphen)
 * @param Component - The React component to render inside the web component
 * @param attributeSchema - Zod schema defining the attributes/props for the component. It needs to be a zod schema resulting in a object shape (e.g. z.interface(), z.object(), etc)
 * @param options - Additional configuration options
 * @param options.mixin - Optional mixin to extend the web component's functionality. Runs after this library's logic
 * @param options.shadowDOM - Controls whether to use Shadow DOM
 *   - If boolean: directly determines Shadow DOM usage
 *   - If function: dynamically determines Shadow DOM usage based on attributes. This only takes effect on the first render
 * @example
 * ```tsx
 * // Define a simple React component
 * const Greeting = ({ firstName, count }: { firstName: string, count: number }) => (
 *   <div>Hello {firstName}, you've visited {count} times!</div>
 * );
 *
 * // Register it as a web component
 * registerWebComponent(
 *   'my-greeting',
 *   Greeting,
 *   z.interface({
 *     firstName: z.string().default('Guest'),
 *     count: z.coerce.number().default(0)
 *   }),
 *   { shadowDOM: true }
 * );
 *
 * // Use in HTML:
 * // <my-greeting first-name="User" count="5"></my-greeting>
 *
 * // Example with conditional Shadow DOM based on attributes
 * const Card = ({ useShadow }: { useShadow: boolean }) => (
 *   <div className="card">
 *     <p>Card content</p>
 *   </div>
 * );
 *
 * // Register with dynamic Shadow DOM decision
 * registerWebComponent(
 *   'shadow-card',
 *   Card,
 *   z.interface({
 *     useShadow: z.stringbool({
 *       falsy: ['false'],
 *       truthy: [''], // empty string is truthy since its what we get when the attribute is just set without a value
 *     })
 *   }),
 *   {
 *     shadowDOM: ({ useShadow }) => useShadow
 *   }
 * );
 *
 * // Use in HTML:
 * // <themeable-card content="This uses shadow DOM" use-shadow></themeable-card>
 * // <themeable-card content="This doesn't use shadow DOM"></themeable-card>
 * ```
 */
export const registerWebComponent = <
    TSchema extends z.ZodType & {
        _zod: {
            def: {
                shape: z.ZodRawShape;
            };
        };
    },
>(
    tagName: string,
    Component: FC<z.output<TSchema>>,
    attributeSchema: TSchema,
    options?: {
        mixin?: Mixin;
        shadowDOM?: ((attributes: z.output<TSchema>) => boolean) | boolean;
    },
) => {
    const hasShadowDOM = (attributes: z.output<TSchema>): boolean =>
        typeof options?.shadowDOM === 'function'
            ? options.shadowDOM(attributes)
            : (options?.shadowDOM ?? false);

    const mixin = options?.mixin ?? (((constructor) => constructor) as Mixin);

    class WebComponent extends mixin(HTMLElement) {
        public static get observedAttributes() {
            return Object.keys(attributeSchema.def.shape).map(toKebabCase);
        }

        public mountingPoint?: HTMLElement;

        public stylesMountingPoint?: HTMLElement;

        private root?: Root;

        private shadowDOM?: boolean;

        public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
            if (!this.isConnected || !this.mountingPoint) return;

            this.render(this.parseAttributes());

            super.attributeChangedCallback?.(name, oldValue, newValue);
        }

        public connectedCallback() {
            const parsedAttributes = this.parseAttributes();

            this.shadowDOM = hasShadowDOM(parsedAttributes);

            if (!this.shadowRoot && this.shadowDOM) {
                this.attachShadow({ mode: 'open' });
            }

            const root = document.createElement('div');
            root.setAttribute('id', 'root');

            const stylesContainer = document.createElement('div');
            stylesContainer.setAttribute('id', 'styles');

            this.mountingPoint = root;
            this.root = createRoot(root);

            this.stylesMountingPoint = stylesContainer;

            const rootContainer = this.shadowRoot ?? this;

            rootContainer.append(this.stylesMountingPoint, this.mountingPoint);

            this.render(parsedAttributes);

            super.connectedCallback?.();
        }

        public disconnectedCallback() {
            this.root?.unmount();

            super.disconnectedCallback?.();
        }

        private parseAttributes(): z.output<TSchema> {
            const attributes: Record<string, unknown> = {};

            for (const attributeName of Object.keys(attributeSchema.def.shape)) {
                if (
                    Object.prototype.hasOwnProperty.call(attributeSchema.def.shape, attributeName)
                ) {
                    const value = this.getAttribute(toKebabCase(attributeName));

                    // If the attribute is not set, we set it to undefined to comply with ts customs
                    if (value === null) {
                        attributes[attributeName] = undefined;
                        continue;
                    }

                    attributes[attributeName] = value;
                }
            }

            return attributeSchema.parse(attributes);
        }

        private render(parsedAttributes: z.output<TSchema>) {
            this.root?.render(
                <WebComponentContextProvider
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    containerElement={this.mountingPoint!}
                    element={this}
                    hasShadowDom={Boolean(this.shadowDOM)}
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    stylesContainer={this.stylesMountingPoint!}
                >
                    {/* TODO: Type this better */}
                    <Component {...(parsedAttributes as Record<string, unknown>)} />
                </WebComponentContextProvider>,
            );
        }
    }

    if (!customElements.get(tagName)) {
        customElements.define(tagName, WebComponent);
    }
};
