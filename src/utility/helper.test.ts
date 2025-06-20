import { attributeBoolean, toKebabCase } from '../../src/utility/helper';
import { describe, expect, it } from 'vitest';

describe('toKebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
        expect(toKebabCase('camelCaseString')).toBe('camel-case-string');
        expect(toKebabCase('camelCASEString')).toBe('camel-case-string');
    });
});

describe('attributeBoolean', () => {
    it('should parse boolean attributes', () => {
        expect(attributeBoolean.parse('true')).toBe(true);
        expect(attributeBoolean.parse(undefined)).toBe(false);
        expect(attributeBoolean.parse('false')).toBe(false);
    });
});
