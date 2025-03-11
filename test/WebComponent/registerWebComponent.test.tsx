import { registerWebComponent } from '../../src/WebComponent/registerWebComponent';
import { type FC } from 'react';
import { type Root } from 'react-dom/client';
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
        const schema = z.object({});

        registerWebComponent('test-component', TestComponent, schema);

        expect(customElements.get('test-component')).toBeDefined();
    });

    it('should not re-register an existing custom element', () => {
        const defineSpy = vi.spyOn(customElements, 'define');
        const TestComponent: FC = () => <div>Test</div>;
        const schema = z.object({});

        registerWebComponent('test-component-2', TestComponent, schema);
        registerWebComponent('test-component-2', TestComponent, schema);

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

        const schema = z.object({
            count: z.number(),
            name: z.string(),
        });

        registerWebComponent('test-component-3', TestComponent, schema);

        const element = document.createElement('test-component-3');
        element.setAttribute('name', 'Test');
        element.setAttribute('count', '42');
        document.body.appendChild(element);

        await nextTick();

        expect(element.textContent).toBe('Test - 42');
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

        const schema = z.object({
            bigIntAttr: z.bigint(),
            dateAttr: z.date(),
            numAttr: z.number(),
            strAttr: z.string(),
            symbolAttr: z.symbol(),
        });

        registerWebComponent('test-component-parse', TestComponent, schema);

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

        const schema = z.object({
            isEnabled: z.boolean(),
        });

        registerWebComponent('test-component-bool', TestComponent, schema);

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

        const schema = z.object({
            optionalAttr: z.string().optional(),
        });

        registerWebComponent('test-component-optional', TestComponent, schema);

        const element = document.createElement('test-component-optional');
        document.body.appendChild(element);
        await nextTick();

        expect(element.textContent).toBe('default');
    });

    it('should create shadow DOM when specified', async () => {
        const TestComponent: FC = () => <div>Shadow DOM Test</div>;
        const schema = z.object({});

        registerWebComponent('test-component-5', TestComponent, schema, {
            shadowDOM: true,
        });

        const element = document.createElement('test-component-5');
        document.body.appendChild(element);

        await nextTick();

        expect(element.shadowRoot).toBeDefined();
        expect(element.shadowRoot?.querySelector('#root')).toBeDefined();
    });

    it('should handle conditional shadow DOM based on attributes', async () => {
        const TestComponent: FC<{ useShadow: boolean }> = () => <div>Conditional Shadow</div>;
        const schema = z.object({
            useShadow: z.boolean(),
        });

        registerWebComponent('test-component-6', TestComponent, schema, {
            shadowDOM: ({ useShadow }) => useShadow,
        });

        const element = document.createElement('test-component-6');
        element.setAttribute('use-shadow', 'true');
        document.body.appendChild(element);

        await nextTick();

        expect(element.shadowRoot).toBeDefined();

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

        const schema = z.object({
            value: z.string(),
        });

        registerWebComponent('test-component-7', TestComponent, schema);

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
        const schema = z.object({});

        registerWebComponent('test-component-8', TestComponent, schema);

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
        const schema = z.object({
            testAttr: z.string().optional(),
        });

        registerWebComponent('test-component-9', TestComponent, schema, {
            mixin,
        });

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
});
