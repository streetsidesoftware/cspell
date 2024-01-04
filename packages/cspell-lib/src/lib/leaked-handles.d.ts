declare module 'leaked-handles' {
    export interface Options {
        timeout?: number;
        fullStack?: boolean;
        debugErrors?: boolean;
        debugSockets?: boolean;
    }

    export function set(opts: Options);
}
