/**
 * Make all properties in T optional and Possibly undefined
 */
export type PartialWithUndefined<T> = {
    [P in keyof T]?: T[P] | undefined;
};

export type Mandatory<T> = {
    [P in keyof T]-?: Exclude<T[P], undefined>;
};
