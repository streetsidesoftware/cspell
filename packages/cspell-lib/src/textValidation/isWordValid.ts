import { SpellingDictionary } from '../SpellingDictionary/SpellingDictionary';
import { TextOffsetRO } from './ValidationTypes';

export interface IsWordValidOptions {
    ignoreCase: boolean;
    useCompounds: boolean | undefined;
}

export function hasWordCheck(dict: SpellingDictionary, word: string, options: IsWordValidOptions): boolean {
    word = word.replace(/\\/g, '');
    return dict.has(word, options);
}

export function isWordValidWithEscapeRetry(
    dict: SpellingDictionary,
    wo: TextOffsetRO,
    line: TextOffsetRO,
    options: IsWordValidOptions
): boolean {
    const firstTry = hasWordCheck(dict, wo.text, options);
    return (
        firstTry ||
        // Drop the first letter if it is preceded by a '\'.
        (line.text[wo.offset - line.offset - 1] === '\\' && hasWordCheck(dict, wo.text.slice(1), options))
    );
}

export const __testing__ = {
    hasWordCheck,
};
