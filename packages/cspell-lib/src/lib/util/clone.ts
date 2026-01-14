export type Handler<T, K extends keyof T> = (src: Readonly<T>, dst: T, key: K) => void;

export type Handlers<T> = {
    [key in keyof T]-?: Handler<T, key>;
};

/**
 * Clones the properties from src to dst using the provided handlers.
 * @param src
 * @param dst
 * @param handlers
 * @param keys
 * @returns
 */
export function cloneInto<T, K extends keyof T>(
    src: Readonly<T>,
    dst: Partial<T>,
    handlers: Handlers<T>,
    keys?: K[],
): Pick<T, K> {
    const keysToProcess = keys || (Object.keys(handlers) as K[]);
    for (const key of keysToProcess) {
        if (src[key] === undefined) continue;
        const handler: Handler<T, K> = handlers[key];
        if (handler === skip) continue;
        handler(src, dst as T, key);
    }

    return dst as T;
}

export function skip<T, K extends keyof T>(_src: Readonly<T>, _dst: T, _key: K): void {
    // do nothing
}

/**
 * Copy the property from src to dst.
 * If the property is undefined, it is not copied.
 * @param src - source object
 * @param dst - destination object
 * @param key - property key
 */
export function copy0<T, K extends keyof T>(src: Readonly<T>, dst: T, key: K): void {
    const value: T[K] | undefined = src[key];
    if (value === undefined) return;
    dst[key] = value;
}

/**
 * Copy the property from src to dst.
 * If the property is undefined, it is not copied.
 * If the property is an array, a shallow copy of the array is made.
 * If the property is a Set, a shallow copy of the Set is made.
 * If the property is a Map, a shallow copy of the Map is made.
 * If the property is an object, a shallow copy of the object is made.
 * @param src - source object
 * @param dst - destination object
 * @param key - property key
 */
export function copy1<T, K extends keyof T>(src: Readonly<T>, dst: T, key: K): void {
    if (src[key] === undefined) return;
    const value: T[K] | undefined = src[key];
    if (value === undefined) return;

    if (Array.isArray(value)) {
        dst[key] = [...value] as T[K];
        return;
    }

    if (value instanceof Set) {
        dst[key] = new Set(value) as T[K];
        return;
    }

    if (value instanceof Map) {
        dst[key] = new Set(value) as T[K];
        return;
    }

    if (value instanceof RegExp) {
        dst[key] = value;
        return;
    }

    if (typeof value === 'object') {
        dst[key] = { ...value } as T[K];
    }

    dst[key] = value;
}
