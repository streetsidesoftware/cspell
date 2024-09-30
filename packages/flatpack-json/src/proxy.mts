/* eslint-disable @typescript-eslint/no-explicit-any */
export function proxyDate(date: Date, onUpdate?: (date: Date) => void): Date {
    class PDate extends Date {
        constructor() {
            super();
            super.setTime(date.getTime());
            proxy(this);
        }
    }

    type KeyofDate = keyof Date;

    function proxy(obj: PDate): Date {
        const props = Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(obj))) as KeyofDate[];
        for (const prop of props) {
            if (prop.toString() === 'constructor') continue;
            if (typeof obj[prop] === 'function') {
                const fn: (...args: any[]) => any = obj[prop];
                const callback = prop.toString().startsWith('set') ? onUpdate : undefined;
                const fObj = obj as Record<KeyofDate, (...args: any[]) => void>;
                fObj[prop] = function (...args: any[]) {
                    let r = fn.apply(obj, args);
                    if (date[prop] !== fn) return r;
                    r = fn.apply(date, args);
                    callback?.(date);
                    return r;
                };
            }
        }
        return obj;
    }

    return new PDate();
}

const debug = false;
const log: typeof console.log = debug ? console.log : () => {};

export function proxyObject<T extends object>(
    obj: T,
    onUpdate?: (obj: T, prop: keyof T, value: T[keyof T]) => void,
): T {
    const proxy = new Proxy(obj, {
        get(target, prop, _receiver) {
            const value = target[prop as keyof T];
            // log('get %o', { prop, match: value === obj[prop as keyof T] });
            if (value instanceof Function) {
                return value.bind(target);
            }
            return value;
        },

        ownKeys(target) {
            const result = Reflect.ownKeys(target);
            // log('ownKeys %o', { result, r_orig: Reflect.ownKeys(obj), match: deepEqual(result, Reflect.ownKeys(obj)) });
            return result;
        },

        getOwnPropertyDescriptor(target, prop) {
            const result = Reflect.getOwnPropertyDescriptor(target, prop);
            // log('getOwnPropertyDescriptor %o', {
            //     prop,
            //     result,
            //     r_orig: Object.getOwnPropertyDescriptor(obj, prop),
            //     match: deepEqual(result, Object.getOwnPropertyDescriptor(obj, prop)),
            // });
            return result;
        },

        has(target, prop) {
            const result = Reflect.has(target, prop);
            // log('has %o', { prop, result, match: result === prop in obj });
            return result;
        },

        set(target, prop, value) {
            // log('set %o', { prop });
            const r = Reflect.set(target, prop, value);
            onUpdate?.(target, prop as keyof T, value);
            return r;
        },

        deleteProperty(target, prop) {
            // log('deleteProperty %o', { prop });
            return Reflect.deleteProperty(target, prop);
        },

        defineProperty(target, prop, descriptor) {
            log('defineProperty %o', { prop });
            return Reflect.defineProperty(target, prop, descriptor);
        },

        getPrototypeOf(target) {
            const result = Reflect.getPrototypeOf(target);
            // log('getPrototypeOf %o', {
            //     match: result === Object.getPrototypeOf(obj) ? true : Object.getPrototypeOf(obj),
            // });
            return result;
        },

        setPrototypeOf(target, prototype) {
            log('setPrototypeOf');
            return Reflect.setPrototypeOf(target, prototype);
        },

        isExtensible(target) {
            const result = Reflect.isExtensible(target);
            // log('isExtensible %o', { result, match: result === Object.isExtensible(obj) });
            return result;
        },

        preventExtensions(target) {
            log('preventExtensions');
            return Reflect.preventExtensions(target);
        },

        apply(target, thisArg, argArray) {
            log('apply');
            return Reflect.apply(target as any, thisArg, argArray);
        },

        construct(target, argArray, newTarget) {
            log('construct');
            return Reflect.construct(target as any, argArray, newTarget);
        },
    });
    return proxy;
}

export function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a === 'function' && typeof b === 'function') return true;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    for (const key in a) {
        if (!(key in b)) return false;
        if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
}

export function proxyMap<K, V>(
    values: Iterable<[K, V]>,
    onUpdate?: (map: Map<K, V>, key: K | undefined, value: V | undefined) => void,
): Map<K, V> {
    class PMap extends Map<K, V> {
        constructor() {
            super();
            // Initialize the map with the values from the original map.
            // This needs to be done instead of `super(fromMap)`, otherwise `this.set` will be called.
            for (const [key, value] of values) {
                super.set(key, value);
            }
        }

        set(key: K, value: V): this {
            const r = super.set(key, value);
            console.log('set', key, value);
            onUpdate?.(this, key, value);
            return r;
        }

        delete(key: K): boolean {
            const r = super.delete(key);
            onUpdate?.(this, key, undefined);
            return r;
        }

        clear(): void {
            super.clear();
            onUpdate?.(this, undefined, undefined);
        }
    }

    return new PMap();
}

export function proxySet<T>(values: Iterable<T>, onUpdate?: (set: Set<T>, value: T | undefined) => void): Set<T> {
    class PSet extends Set<T> {
        constructor() {
            super();
            // Initialize the set with the values from the original set.
            // This needs to be done instead of `super(fromSet)`, otherwise `this.add` will be called.
            for (const value of values) {
                super.add(value);
            }
        }

        add(value: T): this {
            const r = super.add(value);
            onUpdate?.(this, value);
            return r;
        }

        delete(value: T): boolean {
            const r = super.delete(value);
            onUpdate?.(this, value);
            return r;
        }

        clear(): void {
            super.clear();
            onUpdate?.(this, undefined);
        }
    }

    return new PSet();
}
