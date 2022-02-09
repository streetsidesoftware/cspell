/*
 * Verified
 */

/**
 * Make all optional fields required.
 */
export type RequireOptional<T> = { [K in keyof Required<T>]: T[K] };

/**
 * Make all properties in T optional and Possibly undefined
 */
export type PartialWithUndefined<T> = {
    [P in keyof T]?: T[P] | undefined;
};

/**
 * Make all fields mandatory
 */
export type Mandatory<T> = {
    [P in keyof T]-?: Exclude<T[P], undefined>;
};

/**
 * Union the fields
 */
export type UnionFields<T, U> = {
    [K in keyof T | keyof U]: (K extends keyof T ? T[K] : undefined) | (K extends keyof U ? U[K] : undefined);
};

/**
 * The keys of an object where the values cannot be undefined.
 */
export type RequiredKeys<T> = Exclude<
    {
        [P in keyof T]: T[P] extends Exclude<T[P], undefined> ? P : never;
    }[keyof T],
    undefined
>;

/**
 * The keys of an object where the values cannot be undefined.
 */
export type OptionalOrUndefinedKeys<T> = Exclude<
    {
        [P in keyof T]: T[P] extends Exclude<T[P], undefined> ? never : P;
    }[keyof T],
    undefined
>;

/**
 * Extract the fields that cannot be `undefined`
 */
export type OnlyRequired<T> = {
    [P in RequiredKeys<T>]: T[P];
};

/**
 * The keys of an object where the values cannot be undefined.
 */
export type NoUndefined<T> = {
    [P in keyof T]: Exclude<T[P], undefined>;
};

/**
 * Extract the fields that can be `undefined`
 */
export type OnlyOptionalOrUndefined<T> = {
    [P in keyof T as P extends OptionalOrUndefinedKeys<T> ? P : never]: T[P];
};

/**
 * Make fields that can be `undefined` optional
 */
export type MakeOptional<T> = OnlyRequired<T> & Partial<OnlyOptionalOrUndefined<T>>;

/**
 * Like Required, but keeps the Optional.
 */
export type RemoveUndefined<T> = {
    [P in keyof T]: Exclude<T[P], undefined>;
};

/**
 * Make all `undefined` optional and removes the `undefined`
 */
export type UndefinedToOptional<T> = RemoveUndefined<MakeOptional<T>>;

export type ArrayItem<T extends Array<unknown>> = T extends Array<infer R> ? R : never;

// export type UndefinedToOptional<T> =

/*
 * Experimental
 */

// type X = { a: string; b?: string; c: number | undefined };
// type M = MakeOptional<X>;

// type OO = UndefinedToOptional<X>;

// const c: M = { a: 'hello', b: 'h', c: 4 };

// const x = c;
