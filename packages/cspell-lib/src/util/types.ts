// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FunctionArgs<T> = T extends (...args: infer U) => any ? U : any;
