import { registerWebComponent, useWebComponentContext } from '../src';
import { describe, expect, it } from 'vitest';

describe('index', () => {
    it('should export the correct functions', () => {
        expect(useWebComponentContext).toBeDefined();
        expect(registerWebComponent).toBeDefined();
    });
});
