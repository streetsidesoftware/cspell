import { CSpellUserSettings } from '@cspell/cspell-types';
import assert from 'assert';
import { isTextDocument, TextDocument } from '../Models/TextDocument';
import type { ValidationIssue } from '../Models/ValidationIssue';
import * as Settings from '../Settings';
import { Document, resolveDocumentToTextDocument } from '../spellCheckFile';
import { MatchRange } from '../util/TextRange';
import { clean } from '../util/util';
import { DocumentValidator, DocumentValidatorOptions } from './docValidator';
import { calcTextInclusionRanges } from './textValidator';
import { validateText } from './validator';

/**
 * Annotate text with issues and include / exclude zones.
 * @param text - the text to annotate.
 * @param settings - the settings to use.
 * @returns the Check Text result
 * @deprecated
 */
export async function checkText(text: string, settings: CSpellUserSettings): Promise<CheckTextInfo> {
    const doc = clean({
        uri: '',
        text,
        languageId: settings.languageId || 'plaintext',
        locale: settings.language,
    });
    return checkTextDocument(doc, { noConfigSearch: true }, { loadDefaultConfiguration: false, ...settings });
}

/**
 * Annotate text with issues and include / exclude zones.
 * @param text - the text to annotate.
 * @param settings - the settings to use.
 * @returns the Check Text result
 * @deprecated
 */
export async function checkTextOld(text: string, settings: CSpellUserSettings): Promise<CheckTextInfo> {
    const validationResult = validateText(text, settings);
    const finalSettings = Settings.finalizeSettings(settings);
    const includeRanges = calcTextInclusionRanges(text, finalSettings);
    const issues = await validationResult;
    return genResult(text, issues, includeRanges);
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CheckTextOptions extends DocumentValidatorOptions {}

/**
 * Calculate document issues and include / exclude zones.
 * @param doc - document to check
 * @param options - check options
 * @param settings - optional settings
 * @returns
 */
export async function checkTextDocument(
    doc: TextDocument | Document,
    options: CheckTextOptions,
    settings: CSpellUserSettings = {}
): Promise<CheckTextInfo> {
    doc = isTextDocument(doc) ? doc : await resolveDocumentToTextDocument(doc);
    return genCheckText(new DocumentValidator(doc, options, settings));
}

export async function genCheckText(docValidator: DocumentValidator): Promise<CheckTextInfo> {
    await docValidator.prepare();
    const issues = docValidator.checkDocument(true);
    const preparations = docValidator._getPreparations();
    assert(preparations);
    return genResult(docValidator.document.text, issues, preparations.includeRanges);
}

function genResult(text: string, issues: ValidationIssue[], includeRanges: MatchRange[]) {
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
