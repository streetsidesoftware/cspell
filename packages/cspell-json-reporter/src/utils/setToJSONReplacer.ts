/**
 * JSON.stringify replacer which converts Set to Array to allow serialization
 */
export function setToJSONReplacer(_: string, value: unknown): unknown {
    if (typeof value === 'object' && value instanceof Set) {
        return [...value];
    }
    return value;
}
