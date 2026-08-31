import type { MappedText } from '@cspell/cspell-types';
import type { Range } from '@cspell/cspell-types/Parser';

export interface TextTransformer {
    transform(text: string | MappedText): MappedText;
    transformAll(src: Iterable<string | MappedText>): Iterable<MappedText>;
}

export interface Edit {
    /**
     * The replacement text for the edit. This is the text that will replace the original text in the string.
     */
    text: string;
    /**
     * The range of the text to be replaced. This is a tuple of the form `[start, end]`,
     * where start is the index of the first character to be replaced,
     * and end is the index of the first character after the last character to be replaced.
     */
    range: Range;
}

export function toMappedText(text: string | MappedText): MappedText {
    if (typeof text === 'string') {
        return { text, range: [0, text.length], rawText: text };
    }
    return text;
}
