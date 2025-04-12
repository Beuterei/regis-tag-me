export const toKebabCase = (input: string) =>
    input.replaceAll(/([a-z])([A-Z])/gu, '$1-$2').toLowerCase();

export const transformBoolean = (input: string): boolean => {
    if (input === 'false') return false;
    if (input === '') return true;
    return Boolean(input);
};
