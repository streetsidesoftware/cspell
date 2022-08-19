import { CSpellUserSettings, IssueType } from '@cspell/cspell-types';
import { CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef';
import { createTextDocument } from '../Models/TextDocument';
import * as Settings from '../Settings';
import { DirectiveIssue, validateInDocumentSettings } from '../Settings/InDocSettings';
import { CompoundWordsMethod, getDictionaryInternal } from '../SpellingDictionary';
import { callOnce } from '../util/Memorizer';
import { clean } from '../util/util';
import { validateText as validateFullText } from './textValidator';
import type { ValidationOptions, ValidationResult } from './ValidationTypes';

export const diagSource = 'cSpell Checker';

export interface ValidationIssue extends ValidationResult {
    suggestions?: string[];
}

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
    const issues = spellingIssues.concat(mapValidationIssues(text, validationIssues));
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
        // lazy suggestion calculation.
        const suggestions = callOnce(() => dict.suggest(text, sugOptions).map((r) => r.word));
        return Object.defineProperty({ ...t }, 'suggestions', { enumerable: true, get: suggestions });
    });

    return withSugs;
}

function mapValidationIssues(text: string, valIssues: Iterable<DirectiveIssue>): ValidationResult[] {
    const issues = [...valIssues];
    if (!issues.length) return [];

    const document = createTextDocument({ uri: '', content: text });
    const issueType = IssueType.directive;

    function toValidationIssue(dirIssue: DirectiveIssue): ValidationIssue {
        const { text, range, suggestions, message } = dirIssue;
        const offset = range[0];
        const pos = document.positionAt(offset);
        const line = document.getLine(pos.line);
        const issue: ValidationIssue = { text, offset, line, suggestions, message, issueType };

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
