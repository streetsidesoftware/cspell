import type { LoadOptions } from './DictionaryLoader';

export class SpellingDictionaryLoadError extends Error {
    readonly name: string;
    constructor(readonly uri: string, readonly options: LoadOptions, readonly cause: Error, message: string) {
        super(message);
        this.name = options.name;
    }
}

export function isSpellingDictionaryLoadError(e: Error): e is SpellingDictionaryLoadError {
    return e instanceof SpellingDictionaryLoadError;
}
