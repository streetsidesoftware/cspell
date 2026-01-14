export type Handler<T, K extends keyof T> = (src: Readonly<T>, dst: T, key: K) => void;

export type Handlers<T> = {
    [key in keyof T]-?: Handler<T, key>;
};

export function cloneInto<T, K extends keyof T>(src: Readonly<T>, dst: T, handlers: Handlers<T>, keys?: K[]): void {
    const keysToProcess = keys || (Object.keys(handlers) as K[]);
    for (const key of keysToProcess) {
        if (src[key] === undefined) continue;
        const handler: Handler<T, K> = handlers[key];
        handler(src, dst, key);
    }
}
