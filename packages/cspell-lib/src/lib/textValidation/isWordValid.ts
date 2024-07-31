import type { TextOffsetRO } from './ValidationTypes.js';

interface Dict {
    has(word: string): boolean;
}

function hasWordCheck(dict: Dict, word: string): boolean {
    word = word.includes('\\') ? word.replaceAll('\\', '') : word;
    return dict.has(word);
}

export function isWordValidWithEscapeRetry(dict: Dict, wo: TextOffsetRO, line: TextOffsetRO): boolean {
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
