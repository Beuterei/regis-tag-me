import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

export interface WebComponentContext {
    readonly containerElement: HTMLElement;
    readonly element: HTMLElement;
    readonly hasShadowDom: boolean;
    readonly stylesContainer: HTMLElement;
}

export const webComponentContext = createContext<WebComponentContext>({
    containerElement: document.body,
    element: document.body,
    hasShadowDom: true,
    stylesContainer: document.head,
});

export const WebComponentContextProvider = ({
    children,
    containerElement,
    element,
    hasShadowDom,
    stylesContainer,
}: PropsWithChildren<WebComponentContext>) => {
    const webComponentContextValue = useMemo(
        () => ({
            containerElement,
            element,
            hasShadowDom,
            stylesContainer,
        }),
        [containerElement, element, hasShadowDom, stylesContainer],
    );

    return (
        <webComponentContext.Provider value={webComponentContextValue}>
            {children}
        </webComponentContext.Provider>
    );
};

export const useWebComponentContext = () => useContext(webComponentContext);
