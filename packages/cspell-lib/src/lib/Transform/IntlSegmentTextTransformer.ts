import type { MappedText } from '@cspell/cspell-types';

import { normalizeLocaleIntl } from '../Settings/LanguageSettings.js';
import { applyEditsToMappedText } from './TextMapEdit.js';
import type { Edit, TextTransformer } from './Transformer.js';
import { toMappedText } from './Transformer.js';

export const softHyphen = '\u00AD';

const regExSplitWordCharacters: RegExp = /(?<=[\p{L}\p{M}])[\p{L}\p{M}]/uy;

export class IntlSegmentTextTransformer implements TextTransformer {
    #locale: string[];

    constructor(locale: string | string[]) {
        this.#locale = [...normalizeLocaleIntl(locale)];
    }

    transform(text: string | MappedText): MappedText {
        // Implement the transformation logic here
        text = toMappedText(text);
        return segmentText(text, new Intl.Segmenter(this.#locale, { granularity: 'word' }));
    }

    *transformAll(src: Iterable<string | MappedText>): Iterable<MappedText> {
        for (const item of src) {
            yield this.transform(item);
        }
    }
}

function segmentText(mText: MappedText, segmenter: Intl.Segmenter): MappedText {
    const edits: Edit[] = [];
    let lastIndex = -1;
    const reg = new RegExp(regExSplitWordCharacters);
    const text = mText.text;
    for (const { segment, index, isWordLike } of segmenter.segment(mText.text)) {
        const endIndex = index + segment.length;
        reg.lastIndex = index;
        if (isWordLike && index === lastIndex && reg.test(text)) {
            const edit: Edit = { text: softHyphen + segment, range: [index, endIndex] };
            edits.push(edit);
        }
        lastIndex = endIndex;
    }

    return applyEditsToMappedText(mText, edits);
}

export function createIntlSegmentTextTransformer(locale: string | string[]): IntlSegmentTextTransformer {
    return new IntlSegmentTextTransformer(locale);
}
