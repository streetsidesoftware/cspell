import type { CachingDictionary } from 'cspell-dictionary';

import type { TextOffsetRO } from './ValidationTypes';

export function hasWordCheck(dict: CachingDictionary, word: string): boolean {
    word = word.replace(/\\/g, '');
    return dict.has(word);
}

export function isWordValidWithEscapeRetry(dict: CachingDictionary, wo: TextOffsetRO, line: TextOffsetRO): boolean {
    const firstTry = hasWordCheck(dict, wo.text);
    return (
        firstTry ||
        // Drop the first letter if it is preceded by a '\'.
        (line.text[wo.offset - line.offset - 1] === '\\' && hasWordCheck(dict, wo.text.slice(1)))
    );
}

export const __testing__ = {
    hasWordCheck,
};
