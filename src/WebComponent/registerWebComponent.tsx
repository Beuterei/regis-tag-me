import { WebComponentContextProvider } from '../context/webComponentContext';
import { toKebabCase } from '../utility/helper';
import { type FC } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { z } from 'zod';

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
 * @param attributeSchema - Zod schema defining the attributes/props for the component with automatic type conversion for primitives (string, number, boolean, etc.)
 * @param options - Additional configuration options
 * @param options.mixin - Optional mixin to extend the web component's functionality
 * @param options.shadowDOM - Controls whether to use Shadow DOM
 *   - If boolean: directly determines Shadow DOM usage
 *   - If function: dynamically determines Shadow DOM usage based on attributes
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
 *   z.object({
 *     firstName: z.string().default('Guest'),
 *     count: z.number().default(0)
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
 *   z.object({
 *     useShadow: z.boolean().default(false)
 *   }),
 *   {
 *     shadowDOM: ({ useShadow }) => useShadow
 *   }
 * );
 *
 * // Use in HTML:
 * // <themeable-card content="This uses shadow DOM" use-shadow="true"></themeable-card>
 * // <themeable-card content="This doesn't use shadow DOM"></themeable-card>
 * ```
 */
export const registerWebComponent = <TAttributes extends z.ZodObject<Record<string, z.ZodType>>>(
    tagName: string,
    Component: FC<z.output<TAttributes>>,
    attributeSchema: TAttributes,
    options?: {
        mixin?: Mixin;
        shadowDOM?: ((attributes: z.output<TAttributes>) => boolean) | boolean;
    },
) => {
    const hasShadowDOM = (attributes: z.output<TAttributes>): boolean =>
        typeof options?.shadowDOM === 'function'
            ? options.shadowDOM(attributes)
            : (options?.shadowDOM ?? false);

    const mixin = options?.mixin ?? (((constructor) => constructor) as Mixin);

    class WebComponent extends mixin(HTMLElement) {
        public static get observedAttributes() {
            return Object.keys(attributeSchema.shape).map(toKebabCase);
        }

        public mountingPoint?: HTMLElement;

        public stylesMountingPoint?: HTMLElement;

        private root?: Root;

        private shadowDOM?: boolean;

        public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
            super.attributeChangedCallback?.(name, oldValue, newValue);

            if (!this.isConnected || !this.mountingPoint) return;

            this.render(this.parseAttributes());
        }

        public connectedCallback() {
            super.connectedCallback?.();

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
        }

        public disconnectedCallback() {
            super.disconnectedCallback?.();

            this.root?.unmount();
        }

        private parseAttributes(): z.infer<TAttributes> {
            const attributes: Record<
                string,
                bigint | boolean | Date | number | string | Symbol | undefined
            > = {};

            for (const attributeDomName in attributeSchema.shape) {
                if (Object.prototype.hasOwnProperty.call(attributeSchema.shape, attributeDomName)) {
                    const value = this.getAttribute(toKebabCase(attributeDomName));

                    if (value === null) {
                        attributes[attributeDomName] = undefined;
                        continue;
                    }

                    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
                    switch (true) {
                        case attributeSchema.shape[attributeDomName] instanceof z.ZodBoolean:
                            if (value === 'true') {
                                attributes[attributeDomName] = true;
                            } else if (value === 'false') {
                                attributes[attributeDomName] = false;
                                // Since getAttribute returns an empty string for empty attributes, we need to set it to true
                            } else if (value === '') {
                                attributes[attributeDomName] = true;
                            } else {
                                attributes[attributeDomName] = Boolean(value);
                            }

                            break;
                        case attributeSchema.shape[attributeDomName] instanceof z.ZodNumber:
                            attributes[attributeDomName] = Number(value);
                            break;
                        case attributeSchema.shape[attributeDomName] instanceof z.ZodBigInt:
                            attributes[attributeDomName] = BigInt(value);
                            break;
                        case attributeSchema.shape[attributeDomName] instanceof z.ZodSymbol:
                            attributes[attributeDomName] = Symbol(value);
                            break;
                        case attributeSchema.shape[attributeDomName] instanceof z.ZodDate:
                            attributes[attributeDomName] = new Date(value);
                            break;
                        default:
                            attributes[attributeDomName] = value;
                    }
                }
            }

            return attributeSchema.parse(attributes);
        }

        private render(parsedAttributes: z.output<TAttributes>) {
            this.root?.render(
                <WebComponentContextProvider
                    containerElement={this}
                    element={this}
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    hasShadowDom={this.shadowDOM!}
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    stylesContainer={this.stylesMountingPoint!}
                >
                    <Component {...parsedAttributes} />
                </WebComponentContextProvider>,
            );
        }
    }

    if (!customElements.get(tagName)) {
        customElements.define(tagName, WebComponent);
    }
};
