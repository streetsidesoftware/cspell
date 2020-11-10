export type ArgType = number | string | boolean | undefined | null;
type A = ArgType;
const defaultSize = 50000;

export function memorizer<A0 extends A, T>(fn: (arg: A0) => T, size?: number): (arg0: A0) => T;
export function memorizer<A0 extends A, A1 extends A, T>(
    fn: (arg: A0, arg1: A1) => T,
    size?: number
): (arg0: A0, arg1: A1) => T;
// tslint:disable-next-line
export function memorizer<A0 extends A, A1 extends A, A2 extends A, T>(
    fn: (arg: A0, arg1: A1, arg2: A2) => T,
    size?: number
): (arg0: A0, arg1: A1, arg2: A2) => T;
export function memorizer<T>(fn: (...args: ArgType[]) => T, size: number = defaultSize): (...args: ArgType[]) => T {
    const cache = new Map<string, T>();
    return (...args: ArgType[]) => {
        const key = args.join('>!@[');
        if (!cache.has(key)) {
            if (cache.size >= size) {
                cache.clear();
            }
            cache.set(key, fn(...args));
        }
        return cache.get(key)!;
    };
}
