export interface DictionaryInfo {
    /** The name of the dictionary */
    readonly name: string;
    /** Description of the dictionary to display. */
    readonly description?: string;
}

export interface HasOptions {
    ignoreCase?: boolean;
}

export interface FindResult {}

export interface Dictionary extends DictionaryInfo {
    has(word: string, options?: HasOptions): boolean;
    find(word: string, options?: HasOptions): FindResult | undefined;
}
