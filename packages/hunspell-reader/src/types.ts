export interface WordInfo {
    word: string;
    rules: string;
}

export type Dictionary<T, K extends string | number = string> = {
    [index in K]: T;
};

export type Filter<T, U> = T extends U ? T : never;

export type Mapping<F, T> = (keyof F) extends string ? Dictionary<T, Filter<keyof F, string>> : never;
