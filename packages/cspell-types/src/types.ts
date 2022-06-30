/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

export type Serialize<T> = T extends Function
    ? never
    : T extends null
    ? null
    : // : T extends undefined
    // ? undefined
    T extends any[]
    ? SerializeArray<T>
    : T extends object
    ? SerializeObj<T>
    : Primitives<T>;

type SerializeObj<T extends object> = {
    [K in keyof T]: K extends string | number ? Serialize<T[K]> : never;
};

type SerializeArray<T extends Array<any>> = T extends [infer R]
    ? [Serialize<R>]
    : T extends [infer R0, infer R1]
    ? [Serialize<R0>, Serialize<R1>]
    : T extends [infer R0, infer R1, infer R2]
    ? [Serialize<R0>, Serialize<R1>, Serialize<R2>]
    : T extends Array<infer R>
    ? Serialize<R>[]
    : never;

type Primitives<T> = Extract<T, number | string | null | boolean>;

export type Serializable = number | string | boolean | null | object;
