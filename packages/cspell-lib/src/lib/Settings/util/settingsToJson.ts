/* eslint-disable unicorn/no-null */

interface ToJSON {
    toJSON(): unknown;
}

/**
 * Walks a value and converts it into a JSON-serializable representation.
 *
 * This function recursively traverses complex structures and normalizes them
 * so they can be safely passed to {@link JSON.stringify}. The following
 * conversions are applied:
 *
 * - Primitive types (`string`, `number`, `boolean`, `undefined`) are returned as-is.
 * - `null` is returned as `null`.
 * - Objects implementing `toJSON()` are serialized using that method.
 * - `RegExp` instances are converted to their string form (e.g. `/pattern/gi`).
 * - `Map` instances become arrays of `[key, value]` entry pairs, with both keys
 *   and values processed through `walkToJSONObj`.
 * - `Set` instances become arrays of their values, each processed through
 *   `walkToJSONObj`.
 * - Boxed `String` objects are converted to primitive strings.
 * - Arrays are mapped element-wise via `walkToJSONObj`.
 * - Plain objects are converted to new objects whose property values are
 *   processed via `walkToJSONObj`.
 * - `bigint` values are currently returned as-is (note: not natively supported
 *   by `JSON.stringify`).
 * - Functions are converted to `undefined`.
 *
 * @param value - The value to transform into a JSON-serializable structure.
 * @returns A JSON-serializable representation of the input value.
 */
export function walkToJSONObj(value: unknown): unknown {
    const mapVisited = new WeakMap<object, unknown>();

    function walk(value: unknown): unknown {
        switch (typeof value) {
            case 'string':
            case 'number':
            case 'boolean':
            case 'undefined': {
                return value;
            }
            case 'object': {
                return walkObj(value as object);
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

    /**
     * Adds the value/result pair to the visited map.
     * @param value - the original object
     * @param result - the processed or to be processed result
     * @returns result
     */
    function rememberObj<T>(value: object, result: T): T {
        mapVisited.set(value, result);
        return result;
    }

    /**
     * Adds an array to the visited map and processes its entries in place.
     * @param value - the original object
     * @param entries - the array entries, it will be modified in place.
     * @param map - an optional mapping function to apply to each entry.
     * @returns the processed array.
     */
    function rememberArrayAndMapValuesInPlace<T>(
        value: object,
        entries: T[],
        map: (v: T, i: number) => unknown = (entry) => walk(entry),
    ): unknown[] {
        const result = rememberObj(value, entries);
        for (let i = 0; i < entries.length; i++) {
            entries[i] = map(entries[i], i) as T;
        }
        return result;
    }

    /**
     * Walk an object.
     * This function handles circular references.
     *
     * It does this by adding a placeholder to the visited map before processing the object.
     * The placeholder is updated in place with the final result after processing.
     *
     * @param value - the object to walk
     * @returns the walked object
     */
    function walkObj(value: object): unknown {
        const visited = mapVisited.get(value);
        // Note: it is possible that the value is in mapVisited but maps to undefined.
        // It is not worth the cost of checking for that case since the result will be the same.
        if (visited !== undefined) {
            return visited;
        }
        if (value === null) {
            return null;
        }
        if ('toJSON' in value && typeof (value as ToJSON).toJSON === 'function') {
            // We trust the toJSON implementation to handle circular references itself.
            return rememberObj(value, (value as ToJSON).toJSON());
        }
        if (value instanceof RegExp) {
            return rememberObj(value, value.toString());
        }
        if (value instanceof Map) {
            return rememberArrayAndMapValuesInPlace(value, [...value.entries()], (entry) => {
                entry[0] = walk(entry[0]);
                entry[1] = walk(entry[1]);
                return entry;
            });
        }
        if (value instanceof Set) {
            return rememberArrayAndMapValuesInPlace(value, [...value.values()]);
        }
        if (value instanceof String) {
            return rememberObj(value, value.toString());
        }
        if (Array.isArray(value)) {
            return rememberArrayAndMapValuesInPlace(value, [...value]);
        }

        // Plain object - process its properties
        const obj = rememberObj(value, {} as Record<string, unknown>);
        return Object.assign(
            obj,
            Object.fromEntries(Object.entries(value).map(([key, val]) => [key, walk(val)] as const)),
        );
    }

    return walk(value);
}
