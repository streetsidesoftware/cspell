// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ANY = any;

export type OnlyFunctionsOrNever<T> = T extends (...args: ANY[]) => ANY ? T : never;

export type ToReturnPromise<T extends (...args: ANY) => ANY> = T extends (...args: infer A) => infer R
    ? R extends Promise<ANY>
        ? (...args: A) => R
        : (...args: A) => Promise<R>
    : ANY;

export type PromiseOrNever<T> = T extends Promise<ANY> ? T : never;

export type RemovePromise<T> = T extends Promise<infer R> ? R : T;

export type StringKeyOf<T> = Exclude<Extract<keyof T, string>, number | symbol>;

export type MustExtendString<T> = T extends string ? T : never;

export type AsPromise<T> = T extends Promise<ANY> ? T : Promise<T>;
