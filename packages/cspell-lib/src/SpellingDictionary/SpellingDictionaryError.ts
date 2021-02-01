import { LoadOptions } from './DictionaryLoaderTypes';

export class SpellingDictionaryLoadError extends Error {
    constructor(
        readonly name: string,
        readonly uri: string,
        readonly options: LoadOptions,
        readonly cause: Error,
        message: string
    ) {
        super(message);
    }
}

export function isSpellingDictionaryLoadError(e: Error): e is SpellingDictionaryLoadError {
    return e instanceof SpellingDictionaryLoadError;
}
