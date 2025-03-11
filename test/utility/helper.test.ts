import { toKebabCase } from '../../src/utility/helper';
import { describe, expect, it } from 'vitest';

describe('toKebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
        expect(toKebabCase('camelCaseString')).toBe('camel-case-string');
    });
});
