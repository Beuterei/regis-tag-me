import { registerWebComponent } from '../../src/WebComponent/registerWebComponent';
import { transformBoolean } from '../utility/helper';
import { type FC } from 'react';
import { type Root } from 'react-dom/client';
// eslint-disable-next-line id-length
import * as v from 'valibot';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const nextTick = async () =>
    await new Promise<void>((resolve) => {
        setTimeout(resolve);
    });

describe('registerWebComponent', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should register a custom element with the given tag name', () => {
        const TestComponent: FC = () => <div>Test</div>;

        registerWebComponent('test-component', TestComponent, {});

        expect(customElements.get('test-component')).toBeDefined();
    });

    it('should not re-register an existing custom element', () => {
        const defineSpy = vi.spyOn(customElements, 'define');
        const TestComponent: FC = () => <div>Test</div>;

        registerWebComponent('test-component-2', TestComponent, {});
        registerWebComponent('test-component-2', TestComponent, {});

        expect(defineSpy).toHaveBeenCalledTimes(1);
    });

    it('should render the React component with parsed attributes', async () => {
        const TestComponent: FC<{ readonly count: number; readonly name: string }> = ({
            count,
            name,
        }) => (
            <div data-testid="test-output">
                {name} - {count}
            </div>
        );

        registerWebComponent('test-component-3', TestComponent, {
            count: z.coerce.number(),
            name: z.string(),
        });

        const element = document.createElement('test-component-3');
        element.setAttribute('name', 'Test');
        element.setAttribute('count', '42');
        document.body.appendChild(element);

        await nextTick();

        expect(element.textContent).toBe('Test - 42');
    });

    it('should render the React component with parsed attributes with different standard schema', async () => {
        const TestComponent: FC<{ readonly count: number; readonly name: string }> = ({
            count,
            name,
        }) => (
            <div data-testid="test-output">
                {name} - {count}
            </div>
        );

        registerWebComponent('test-component-3', TestComponent, {
            count: v.pipe(v.string(), v.transform(Number)),
            name: v.string(),
        });

        const element = document.createElement('test-component-3');
        element.setAttribute('name', 'Test');
        element.setAttribute('count', '42');
        document.body.appendChild(element);

        await nextTick();

        expect(element.textContent).toBe('Test - 42');
    });

    it('should handle default values', async () => {
        const TestComponent: FC<{ readonly count: number; readonly name: string }> = ({
            count,
            name,
        }) => (
            <div>
                {name} - {count}
            </div>
        );

        registerWebComponent('test-component-default', TestComponent, {
            count: z.coerce.number().default(0),
            name: z.string().default('Default'),
        });

        const element = document.createElement('test-component-default');
        document.body.appendChild(element);

        await nextTick();

        expect(element.textContent).toBe('Default - 0');
    });

    it('should parse different attribute types correctly', async () => {
        const TestComponent: FC<{
            readonly bigIntAttr: bigint;
            readonly dateAttr: Date;
            readonly numAttr: number;
            readonly strAttr: string;
            readonly symbolAttr: symbol;
        }> = ({ bigIntAttr, dateAttr, numAttr, strAttr, symbolAttr }) => (
            <div data-testid="test-output">
                {typeof bigIntAttr},{typeof dateAttr},{typeof numAttr},{typeof strAttr},
                {typeof symbolAttr}
            </div>
        );

        registerWebComponent('test-component-parse', TestComponent, {
            bigIntAttr: z.coerce.bigint(),
            dateAttr: z.coerce.date(),
            numAttr: z.coerce.number(),
            strAttr: z.string(),
            symbolAttr: z.string().transform(Symbol),
        });

        const element = document.createElement('test-component-parse');
        element.setAttribute('big-int-attr', '1234567890');
        element.setAttribute('num-attr', '42');
        element.setAttribute('str-attr', 'hello');
        element.setAttribute('symbol-attr', 'symbol');
        const testDate = new Date('2024-01-01');
        element.setAttribute('date-attr', testDate.toISOString());

        document.body.appendChild(element);
        await nextTick();

        expect(element.textContent).toBe(`bigint,object,number,string,symbol`);
    });

    it('should handle boolean attributes in different formats', async () => {
        const TestComponent: FC<{ readonly isEnabled: boolean }> = ({ isEnabled }) => (
            <div>{String(isEnabled)}</div>
        );

        registerWebComponent('test-component-bool', TestComponent, {
            isEnabled: z.string().transform(transformBoolean),
        });

        const element1 = document.createElement('test-component-bool');
        element1.setAttribute('is-enabled', '');
        document.body.appendChild(element1);
        await nextTick();
        expect(element1.textContent).toBe('true');

        const element2 = document.createElement('test-component-bool');
        element2.setAttribute('is-enabled', 'true');
        document.body.appendChild(element2);
        await nextTick();
        expect(element2.textContent).toBe('true');

        const element3 = document.createElement('test-component-bool');
        element3.setAttribute('is-enabled', 'false');
        document.body.appendChild(element3);
        await nextTick();
        expect(element3.textContent).toBe('false');

        const element4 = document.createElement('test-component-bool');
        element4.setAttribute('is-enabled', 'some-value');
        document.body.appendChild(element4);
        await nextTick();
        expect(element4.textContent).toBe('true');
    });

    it('should handle missing optional attributes', async () => {
        const TestComponent: FC<{ readonly optionalAttr?: string }> = ({ optionalAttr }) => (
            <div>{optionalAttr ?? 'default'}</div>
        );

        registerWebComponent('test-component-optional', TestComponent, {
            optionalAttr: z.string().optional(),
        });

        const element = document.createElement('test-component-optional');
        document.body.appendChild(element);
        await nextTick();

        expect(element.textContent).toBe('default');
    });

    it('should create shadow DOM when specified', async () => {
        const TestComponent: FC = () => <div>Shadow DOM Test</div>;

        registerWebComponent(
            'test-component-5',
            TestComponent,
            {},
            {
                shadowDOM: true,
            },
        );

        const element = document.createElement('test-component-5');
        document.body.appendChild(element);

        await nextTick();

        expect(element.shadowRoot).toBeDefined();
        expect(element.shadowRoot?.querySelector('#root')).toBeDefined();
    });

    it('should handle conditional shadow DOM based on attributes when enabled', async () => {
        const TestComponent: FC<{ useShadow: boolean }> = () => <div>Conditional Shadow</div>;

        registerWebComponent(
            'test-component-6',
            TestComponent,
            {
                useShadow: z.string().transform(transformBoolean),
            },
            {
                shadowDOM: ({ useShadow }) => useShadow,
            },
        );

        const element = document.createElement('test-component-6');
        element.setAttribute('use-shadow', 'true');
        document.body.appendChild(element);

        await nextTick();

        expect(element.shadowRoot).toBeDefined();
    });

    it('should handle conditional shadow DOM based on attributes when disabled', async () => {
        const TestComponent: FC<{ useShadow: boolean }> = () => <div>Conditional Shadow</div>;

        registerWebComponent(
            'test-component-6',
            TestComponent,
            {
                useShadow: z.string().transform(transformBoolean),
            },
            {
                shadowDOM: ({ useShadow }) => useShadow,
            },
        );

        const element2 = document.createElement('test-component-6');
        element2.setAttribute('use-shadow', 'false');
        document.body.appendChild(element2);

        await nextTick();

        expect(element2.shadowRoot).toBeNull();
    });

    it('should handle component updates when attributes change', async () => {
        const TestComponent: FC<{ readonly value: string }> = ({ value }) => (
            <div data-testid="test-output">{value}</div>
        );

        registerWebComponent('test-component-7', TestComponent, {
            value: z.string(),
        });

        const element = document.createElement('test-component-7');
        element.setAttribute('value', 'initial');
        document.body.appendChild(element);

        await nextTick();
        expect(element.textContent).toBe('initial');

        element.setAttribute('value', 'updated');
        await nextTick();
        expect(element.textContent).toBe('updated');
    });

    it('should cleanup React root on disconnection', async () => {
        const TestComponent: FC = () => <div>Cleanup Test</div>;

        registerWebComponent('test-component-8', TestComponent, {});

        const element = document.createElement('test-component-8');
        document.body.appendChild(element);

        await nextTick();

        const unmountSpy = vi.spyOn((element as unknown as { root: Root }).root, 'unmount');

        element.remove();

        expect(unmountSpy).toHaveBeenCalled();
    });

    it('should apply mixins correctly', async () => {
        const connectedCallback = vi.fn();
        const disconnectedCallback = vi.fn();
        const attributeChangedCallback = vi.fn();

        const mixin = (base: CustomElementConstructor) => {
            return class extends base {
                attributeChangedCallback(name: string, oldValue: string, newValue: string) {
                    attributeChangedCallback(name, oldValue, newValue);
                }

                connectedCallback() {
                    connectedCallback();
                }

                disconnectedCallback() {
                    disconnectedCallback();
                }
            };
        };

        const TestComponent: FC = () => <div>Mixin Test</div>;

        registerWebComponent(
            'test-component-9',
            TestComponent,
            {
                testAttr: z.string().optional(),
            },
            {
                mixin,
            },
        );

        const element = document.createElement('test-component-9');
        document.body.appendChild(element);

        await nextTick();

        element.setAttribute('test-attr', 'test-value');

        await nextTick();

        element.remove();

        expect(connectedCallback).toHaveBeenCalled();
        expect(disconnectedCallback).toHaveBeenCalled();
        expect(attributeChangedCallback).toHaveBeenCalled();
    });

    it('should throw TypeError for async schema validation', () => {
        const TestComponent: FC<{ readonly value: string }> = ({ value }) => <div>{value}</div>;

        registerWebComponent('test-component-async', TestComponent, {
            value: z.string().refine(async () => true),
        });

        const element = document.createElement('test-component-async') as HTMLElement & {
            connectedCallback: () => void;
        };
        element.setAttribute('value', 'test');

        expect(() => {
            element.connectedCallback();
        }).toThrowError('Schema validation must be synchronous');
    });

    it('should throw Error for invalid schema validation', () => {
        const TestComponent: FC<{ readonly value: number }> = ({ value }) => <div>{value}</div>;

        registerWebComponent('test-component-invalid', TestComponent, {
            value: z.number(),
        });

        const element = document.createElement('test-component-invalid') as HTMLElement & {
            connectedCallback: () => void;
        };
        element.setAttribute('value', 'not-a-number');

        expect(() => {
            element.connectedCallback();
        }).toThrowError(/Expected number/u);
    });
});
