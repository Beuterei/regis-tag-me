import { WebComponentContextProvider } from '../context/webComponentContext';
import { toKebabCase } from '../utility/helper';
import { type StandardSchemaV1 } from '@standard-schema/spec';
import { type FC } from 'react';
import { createRoot, type Root } from 'react-dom/client';

type AttributeOutput<TAttributes extends Record<string, StandardSchemaV1>> = {
    [k in keyof TAttributes]: StandardSchemaV1.InferOutput<TAttributes[k]>;
};

type AttributeShape<TAttributes extends Record<string, StandardSchemaV1>> = {
    [k in keyof TAttributes]: TAttributes[k];
};

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
 * @param attributeSchema - StandardSchemaV1 schema defining the attributes/props for the component
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
 *   {
 *     firstName: z.string().default('Guest'),
 *     count: z.coerce.number().default(0)
 *   },
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
 *   {
 *     useShadow: z.string().transform(transformBoolean) // transformBoolean is a helper function that converts strings to booleans
 *   },
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
export const registerWebComponent = <TAttributes extends Record<string, StandardSchemaV1>>(
    tagName: string,
    Component: FC<AttributeOutput<TAttributes>>,
    attributeSchema: AttributeShape<TAttributes>,
    options?: {
        mixin?: Mixin;
        shadowDOM?: ((attributes: AttributeOutput<TAttributes>) => boolean) | boolean;
    },
) => {
    const hasShadowDOM = (attributes: AttributeOutput<TAttributes>): boolean =>
        typeof options?.shadowDOM === 'function'
            ? options.shadowDOM(attributes)
            : (options?.shadowDOM ?? false);

    const mixin = options?.mixin ?? (((constructor) => constructor) as Mixin);

    class WebComponent extends mixin(HTMLElement) {
        public static get observedAttributes() {
            return Object.keys(attributeSchema).map(toKebabCase);
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

        private parseAttributes(): AttributeOutput<TAttributes> {
            const attributes: AttributeOutput<TAttributes> = {} as AttributeOutput<TAttributes>;

            for (const attributeDomName of Object.keys(attributeSchema)) {
                const attributeValue = this.getAttribute(toKebabCase(attributeDomName));

                if (Object.prototype.hasOwnProperty.call(attributeSchema, attributeDomName)) {
                    const result = attributeSchema[attributeDomName]['~standard'].validate(
                        attributeValue ?? undefined,
                    );

                    if (result instanceof Promise) {
                        throw new TypeError('Schema validation must be synchronous');
                    }

                    if (result.issues) {
                        throw new Error(JSON.stringify(result.issues, null, 2));
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (attributes as any)[attributeDomName] = result.value;
                }
            }

            return attributes;
        }

        private render(parsedAttributes: AttributeOutput<TAttributes>) {
            this.root?.render(
                <WebComponentContextProvider
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    containerElement={this.mountingPoint!}
                    element={this}
                    hasShadowDom={Boolean(this.shadowDOM)}
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
