export function isDefined<T>(a: T | undefined | null): a is T {
    return !!a || (a !== null && a !== undefined);
}
