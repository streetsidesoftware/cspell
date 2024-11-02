/**
 * Make all properties in T required, but keep the original optionality of the properties.
 */
export type RequireFields<T> = {
    [P in keyof Required<T>]: T[P];
};
