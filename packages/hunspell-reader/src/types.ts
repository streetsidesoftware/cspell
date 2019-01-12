export interface WordInfo {
    word: string;
    rules: string;
}

export interface Dictionary<T>{
    [index: string]: T;
}
