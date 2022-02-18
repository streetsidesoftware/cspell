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
export type OptionalKeys<T> = Exclude<
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
 * Extract the fields that can be `undefined`
 */
export type OnlyOptional<T> = {
    [P in keyof T as P extends OptionalKeys<T> ? P : never]: T[P];
};

export type MakeOptional<T> = OnlyRequired<T> & Partial<OnlyOptional<T>>;

/**
 * Like Required, but keeps the Optional.
 */
export type RemoveUndefined<T> = {
    [P in keyof T]: Exclude<T[P], undefined>;
};

/**
 * Allow undefined in optional fields
 */
export type OptionalOrUndefined<T> = {
    [P in keyof T]: P extends OptionalKeys<T> ? T[P] | undefined : T[P];
};

/*
 * Experimental
 */
