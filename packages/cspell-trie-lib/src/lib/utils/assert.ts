export function assert(condition: unknown, message = 'Assert Failed'): asserts condition {
    if (condition) return;
    throw new Error(message);
}
