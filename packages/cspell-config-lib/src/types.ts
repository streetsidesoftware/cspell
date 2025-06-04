export type Head<T extends unknown[]> = T extends [infer U, ...unknown[]] ? U : never;
export type Tail<T extends unknown[]> = T extends [unknown, ...infer U] ? U : never;
export type Last<T extends unknown[]> = T extends [...unknown[], infer U] ? U : never;
export type Single<T extends unknown[]> = T extends [infer U] ? U : never;

export type Rec<T> = T extends object ? T : never;

export type KeyOf<T> = T extends object ? keyof T : never;
export type KeyOf1<T, K1 extends KeyOf<T>> = KeyOf<T[K1]>;
export type KeyOf2<T, K1 extends KeyOf<T>, K2 extends KeyOf1<T, K1>> = KeyOf<ValueOf2<T, K1, K2>>;
export type KeyOf3<T, K1 extends KeyOf<T>, K2 extends KeyOf1<T, K1>, K3 extends KeyOf2<T, K1, K2>> = KeyOf<
    ValueOf3<T, K1, K2, K3>
>;

export type ValueOf1<T, K extends KeyOf<T>> = T[K];
export type ValueOf2<T, K extends KeyOf<T>, K1 extends KeyOf1<T, K>> = ValueOf1<Rec<T[K]>, K1>;
export type ValueOf3<T, K extends KeyOf<T>, K1 extends KeyOf1<T, K>, K2 extends KeyOf2<T, K, K1>> = Rec<
    ValueOf2<T, K, K1>
>[K2];
export type ValueOf4<
    T,
    K extends KeyOf<T>,
    K1 extends KeyOf1<T, K>,
    K2 extends KeyOf2<T, K, K1>,
    K3 extends KeyOf3<T, K, K1, K2>,
> = Rec<ValueOf3<T, K, K1, K2>>[K3];

export type KeyOfValueOf<T, K extends KeyOf<T>> = KeyOf<ValueOf1<T, K>>;

export type ArrayValue<T> = T extends unknown[] ? T[number] : never;
