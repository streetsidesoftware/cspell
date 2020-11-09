export type FunctionArgs<T> = T extends (...args: infer U) => any ? U : any;
