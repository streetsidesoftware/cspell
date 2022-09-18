export function isDefined<T>(v: T | undefined): v is T {
    return v !== undefined;
}
