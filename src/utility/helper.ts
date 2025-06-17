import { z } from 'zod/v4';

export const toKebabCase = (input: string) =>
    input
        .replaceAll(/([a-z])([A-Z])/gu, '$1-$2')
        .replaceAll(/([A-Z])([A-Z][a-z])/gu, '$1-$2')
        .toLowerCase();

export const attributeBoolean = z
    .string()
    .default('false')
    .transform((value) => value === '' || value === 'true');
