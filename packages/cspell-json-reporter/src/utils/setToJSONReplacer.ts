/**
 * JSON.stringify replacer which converts Set to Array to allow serialization
 */
export function setToJSONReplacer(_: string, value: unknown): unknown {
    return typeof value === 'object' && value instanceof Set ? [...value] : value;
}
