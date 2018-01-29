import * as Text from './util/text';
import * as Dictionary from './SpellingDictionary';
import * as Settings from './Settings';

export const diagSource = 'cSpell Checker';

import { CSpellUserSettings } from './Settings';
import * as TV from './textValidator';

export { IncludeExcludeOptions } from './textValidator';

export function validateText(text: string, settings: CSpellUserSettings): Promise<Text.TextOffset[]> {
    const finalSettings = Settings.finalizeSettings(settings);
    const dict = Dictionary.getDictionary(finalSettings);
    return dict.then(dict => [...TV.validateText(text, dict, finalSettings)]);
}

export interface CheckTextInfo {
    // Full text
    text: string;
    // Set of include items
    items: TextInfoItem[];
}

export interface TextInfoItem {
    // the segment of text that is either include or excluded
    text: string;
    startPos: number;
    endPos: number;
    flagIE: IncludeExcludeFlag;
    isError?: boolean;
}

export enum IncludeExcludeFlag {
    INCLUDE = 'I',
    EXCLUDE = 'E',
}

export function checkText(
    text: string,
    settings: CSpellUserSettings,
): CheckTextInfo {
    const includeRanges = TV.calcTextInclusionRanges(text, settings);
    const result: TextInfoItem[] = [];
    let lastPos = 0;
    for (const { startPos, endPos } of includeRanges) {
        result.push({
            text: text.slice(lastPos, startPos),
            startPos: lastPos,
            endPos: startPos,
            flagIE: IncludeExcludeFlag.EXCLUDE,
        });
        result.push({
            text: text.slice(startPos, endPos),
            startPos,
            endPos,
            flagIE: IncludeExcludeFlag.INCLUDE,
        });
        lastPos = endPos;
    }
    result.push({
        text: text.slice(lastPos),
        startPos: lastPos,
        endPos: text.length,
        flagIE: IncludeExcludeFlag.EXCLUDE,
    });

    return {
        text,
        items: result.filter(i => i.startPos !== i.endPos),
    };
}



