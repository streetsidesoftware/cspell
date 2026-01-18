/* eslint-disable unicorn/no-null */

interface ToJSON {
    toJSON(): unknown;
}

export function walkToJSONObj(value: unknown): unknown {
    switch (typeof value) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'undefined': {
            return value;
        }
        case 'object': {
            if (value === null) {
                return null;
            }
            if ('toJSON' in value && typeof (value as ToJSON).toJSON === 'function') {
                return (value as ToJSON).toJSON();
            }
            if (value instanceof RegExp) {
                return value.toString();
            }
            if (value instanceof Map) {
                return [...value.entries()].map(([key, val]) => [walkToJSONObj(key), walkToJSONObj(val)] as const);
            }
            if (value instanceof Set) {
                return [...value.values()].map(walkToJSONObj);
            }
            if (value instanceof String) {
                return value.toString();
            }
            if (Array.isArray(value)) {
                return value.map(walkToJSONObj);
            }
            return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, walkToJSONObj(val)] as const));
        }
        case 'bigint': {
            return value; // return as is for now
        }
        case 'function': {
            return undefined; // `[function ${value.name || 'anonymous'}]`;
        }
        default: {
            return undefined;
        }
    }
}
