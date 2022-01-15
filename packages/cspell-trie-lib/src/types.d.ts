/**
 * Make all properties in T optional and Possibly undefined
 */
type PartialWithUndefined<T> = {
    [P in keyof T]?: T[P] | undefined;
};

type Mandatory<T> = {
    [P in keyof T]-?: Exclude<T[P], undefined>;
};
