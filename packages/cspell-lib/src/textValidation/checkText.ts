import { CSpellUserSettings } from '@cspell/cspell-types';
import * as Settings from '../Settings';
import { calcTextInclusionRanges } from './textValidator';
import { validateText } from './validator';

export async function checkText(text: string, settings: CSpellUserSettings): Promise<CheckTextInfo> {
    const validationResult = validateText(text, settings);
    const finalSettings = Settings.finalizeSettings(settings);
    const includeRanges = calcTextInclusionRanges(text, finalSettings);
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

    const issues = await validationResult;

    function* merge() {
        let i = 0;
        for (const r of result) {
            if (i >= issues.length || issues[i].offset >= r.endPos) {
                yield r;
                continue;
            }
            const span = { ...r };
            while (i < issues.length && issues[i].offset < span.endPos) {
                const issue = issues[i];
                const endPos = issue.offset;
                const text = span.text.slice(0, endPos - span.startPos);
                const endPosError = issue.offset + issue.text.length;
                yield { ...span, text, endPos };
                yield {
                    ...span,
                    isError: true,
                    startPos: issue.offset,
                    endPos: endPosError,
                    text: issue.text,
                };
                span.text = span.text.slice(endPosError - span.startPos);
                span.startPos = endPosError;
                i += 1;
            }
            yield span;
        }
    }

    return {
        text,
        items: [...merge()].filter((i) => i.startPos < i.endPos),
    };
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
