export const toKebabCase = (input: string) =>
    input.replaceAll(/([a-z])([A-Z])/gu, '$1-$2').toLowerCase();
