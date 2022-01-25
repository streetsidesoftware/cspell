export function isDefined<T>(a: T | undefined): a is T {
    return a !== undefined;
}
