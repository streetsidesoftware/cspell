import { CSpellUserSettings, IssueType } from '@cspell/cspell-types';
import { CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef';
import { createTextDocument } from '../Models/TextDocument';
import type { ValidationIssue } from '../Models/ValidationIssue';
import * as Settings from '../Settings';
import { DirectiveIssue, validateInDocumentSettings } from '../Settings/InDocSettings';
import { CompoundWordsMethod, getDictionaryInternal } from '../SpellingDictionary';
import { clean } from '../util/util';
import { validateText as validateFullText } from './textValidator';
import type { ValidationOptions } from './ValidationTypes';

export const diagSource = 'cSpell Checker';

export interface ValidateTextOptions {
    /**
     * Generate suggestions where there are spelling issues.
     */
    generateSuggestions?: boolean;
    /**
     * The number of suggestions to generate. The higher the number the longer it takes.
     */
    numSuggestions?: number;

    /**
     * Verify that the in-document directives are correct.
     */
    validateDirectives?: boolean;
}

/**
 * @deprecated
 * @deprecationMessage Use spellCheckDocument
 */
export async function validateText(
    text: string,
    settings: CSpellUserSettings,
    options: ValidateTextOptions = {}
): Promise<ValidationIssue[]> {
    const finalSettings = Settings.finalizeSettings(settings);
    const dict = await getDictionaryInternal(finalSettings);
    const spellingIssues = [...validateFullText(text, dict, settingsToValidateOptions(finalSettings))];
    const validationIssues =
        options.validateDirectives || finalSettings.validateDirectives
            ? validateInDocumentSettings(text, settings)
            : [];
    const issues: ValidationIssue[] = spellingIssues.concat(mapValidationIssues(text, validationIssues));
    if (!options.generateSuggestions) {
        return issues;
    }
    const sugOptions = clean({
        numSuggestions: options.numSuggestions,
        compoundMethod: CompoundWordsMethod.NONE,
        includeTies: false,
        ignoreCase: !(settings.caseSensitive ?? false),
        timeout: settings.suggestionsTimeout,
        numChanges: settings.suggestionNumChanges,
    });
    const withSugs = issues.map((t) => {
        const text = t.text;
        const suggestionsEx = dict
            .suggest(text, sugOptions)
            .map(({ word, isPreferred }) => (isPreferred ? { word, isPreferred } : { word }));
        t.suggestions = suggestionsEx.map((s) => s.word);
        t.suggestionsEx = suggestionsEx;
        return t;
    });

    return withSugs;
}

function mapValidationIssues(text: string, valIssues: Iterable<DirectiveIssue>): ValidationIssue[] {
    const issues = [...valIssues];
    if (!issues.length) return [];

    const document = createTextDocument({ uri: '', content: text });
    const issueType = IssueType.directive;

    function toValidationIssue(dirIssue: DirectiveIssue): ValidationIssue {
        const { text, range, suggestions, suggestionsEx, message } = dirIssue;
        const offset = range[0];
        const pos = document.positionAt(offset);
        const line = document.getLine(pos.line);
        const issue: ValidationIssue = { text, offset, line, suggestions, suggestionsEx, message, issueType };

        return issue;
    }

    return issues.map(toValidationIssue);
}

export function settingsToValidateOptions(settings: CSpellSettingsInternalFinalized): ValidationOptions {
    const opt: ValidationOptions = {
        ...settings,
        ignoreCase: !(settings.caseSensitive ?? false),
    };
    return opt;
}
