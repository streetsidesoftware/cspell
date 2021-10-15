export function isDefined<T>(t: T | undefined): t is T {
    return t !== undefined && t !== null;
}
