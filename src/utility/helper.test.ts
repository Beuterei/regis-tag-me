import { toKebabCase, transformBoolean } from '../../src/utility/helper';
import { describe, expect, it } from 'vitest';

describe('toKebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
        expect(toKebabCase('camelCaseString')).toBe('camel-case-string');
    });
});

describe('transformBoolean', () => {
    it('should return false when input is "false"', () => {
        expect(transformBoolean('false')).toBe(false);
    });

    it('should return true when input is empty string', () => {
        expect(transformBoolean('')).toBe(true);
    });

    it('should return true for truthy string values', () => {
        expect(transformBoolean('true')).toBe(true);
        expect(transformBoolean('1')).toBe(true);
        expect(transformBoolean('hello')).toBe(true);
    });
});
