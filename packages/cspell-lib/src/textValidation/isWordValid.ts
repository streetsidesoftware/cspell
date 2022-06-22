import { HasOptions, SpellingDictionary } from '../SpellingDictionary/SpellingDictionary';
import { clean } from '../util/util';
import { TextOffsetRO } from './ValidationTypes';

export interface IsWordValidOptions {
    ignoreCase: boolean;
    useCompounds: boolean | undefined;
}

function hasWordCheck(dict: SpellingDictionary, word: string, options: IsWordValidOptions): boolean {
    word = word.replace(/\\/g, '');
    // Do not pass allowCompounds down if it is false, that allows for the dictionary to override the value based upon its own settings.
    return dict.has(word, convertCheckOptionsToHasOptions(options));
}
function convertCheckOptionsToHasOptions(opt: IsWordValidOptions): HasOptions {
    const { ignoreCase, useCompounds } = opt;
    return clean({
        ignoreCase,
        useCompounds,
    });
}

export function isWordValid(
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
