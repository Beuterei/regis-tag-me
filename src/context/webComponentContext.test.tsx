import {
    useWebComponentContext,
    type WebComponentContext,
    WebComponentContextProvider,
} from '../../src/context/webComponentContext';
import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('webComponentContext', () => {
    const testElement = document.createElement('div');
    const testContainer = document.createElement('div');
    const testStylesContainer = document.createElement('div');

    const testContextValue: WebComponentContext = {
        containerElement: testContainer,
        element: testElement,
        hasShadowDom: false,
        stylesContainer: testStylesContainer,
    };

    describe('WebComponentContextProvider', () => {
        it('should provide context values and update them when props change', () => {
            const TestComponent = () => {
                const context = useWebComponentContext();
                return <div data-testid="test">{JSON.stringify(context)}</div>;
            };

            const { rerender } = render(
                <WebComponentContextProvider {...testContextValue}>
                    <TestComponent />
                </WebComponentContextProvider>,
            );

            expect(screen.getByTestId('test').textContent).toBe(JSON.stringify(testContextValue));

            const newElement = document.createElement('div');
            rerender(
                <WebComponentContextProvider
                    {...testContextValue}
                    element={newElement}
                    hasShadowDom
                >
                    <TestComponent />
                </WebComponentContextProvider>,
            );

            expect(screen.getByTestId('test').textContent).toBe(
                JSON.stringify({ ...testContextValue, element: newElement, hasShadowDom: true }),
            );
        });
    });

    describe('useWebComponentContext', () => {
        it('should use default values when no provider is present', () => {
            const { result } = renderHook(() => useWebComponentContext());

            expect(result.current.hasShadowDom).toBe(true);
            expect(result.current.element).toBe(document.body);
            expect(result.current.containerElement).toBe(document.body);
            expect(result.current.stylesContainer).toBe(document.head);
        });

        it('should throw error when used outside of provider', () => {
            const { result } = renderHook(() => useWebComponentContext());
            expect(result.current).toBeDefined();
        });
    });
});
