import * as stuff from '../src';
import { describe, expect, it } from 'vitest';

describe('index', () => {
    it('should export the correct functions', () => {
        expect(Object.keys(stuff).sort((a, b) => a.localeCompare(b))).toEqual(
            ['useWebComponentContext', 'transformBoolean', 'registerWebComponent'].sort((a, b) =>
                a.localeCompare(b),
            ),
        );
    });
});
