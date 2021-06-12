const defaultSize = 50000;

export function memorizer<A0, T>(fn: (arg: A0) => T, size?: number): (arg0: A0) => T;
export function memorizer<A0, A1, T>(fn: (arg: A0, arg1: A1) => T, size?: number): (arg0: A0, arg1: A1) => T;
export function memorizer<A0, A1, A2, T>(
    fn: (arg: A0, arg1: A1, arg2: A2) => T,
    size?: number
): (arg0: A0, arg1: A1, arg2: A2) => T;
export function memorizer<A, T>(fn: (...args: A[]) => T, size: number = defaultSize): (...args: A[]) => T {
    const cache = new Map<string, T>();
    return (...args: A[]) => {
        const key = args.join('>!@[');
        if (!cache.has(key)) {
            if (cache.size >= size) {
                cache.clear();
            }
            cache.set(key, fn(...args));
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return cache.get(key)!;
    };
}
