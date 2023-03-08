import { opConcatMap, opMap, pipeSync } from '@cspell/cspell-pipe/sync';
import type {
    CSpellSettingsWithSourceTrace,
    CSpellUserSettings,
    MappedText,
    ParsedText,
    PnPSettings,
} from '@cspell/cspell-types';
import { IssueType } from '@cspell/cspell-types';
import assert from 'assert';
import { GlobMatcher } from 'cspell-glob';
import path from 'path';

import type { CSpellSettingsInternal, CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef.js';
import type { ExtendedSuggestion } from '../Models/Suggestion.js';
import type { TextDocument, TextDocumentLine, TextDocumentRef } from '../Models/TextDocument.js';
import { updateTextDocument } from '../Models/TextDocument.js';
import type { ValidationIssue } from '../Models/ValidationIssue.js';
import { loadConfigSync, searchForConfigSync } from '../Settings/Controller/configLoader/index.js';
import { finalizeSettings, loadConfig, mergeSettings, searchForConfig } from '../Settings/index.js';
import type { DirectiveIssue } from '../Settings/InDocSettings.js';
import { validateInDocumentSettings } from '../Settings/InDocSettings.js';
import type { SpellingDictionaryCollection } from '../SpellingDictionary/index.js';
import { getDictionaryInternal, getDictionaryInternalSync } from '../SpellingDictionary/index.js';
import type { WordSuggestion } from '../suggestions.js';
import { calcSuggestionAdjustedToToMatchCase } from '../suggestions.js';
import { catchPromiseError, toError, wrapCall } from '../util/errors.js';
import { AutoCache } from '../util/simpleCache.js';
import type { MatchRange } from '../util/TextRange.js';
import { createTimer } from '../util/timer.js';
import { uriToFilePath } from '../util/Uri.js';
import { defaultMaxDuplicateProblems, defaultMaxNumberOfProblems } from './defaultConstants.js';
import { determineTextDocumentSettings } from './determineTextDocumentSettings.js';
import type { TextValidator } from './lineValidatorFactory.js';
import { textValidatorFactory } from './lineValidatorFactory.js';
import type { SimpleRange } from './parsedText.js';
import { createMappedTextSegmenter } from './parsedText.js';
import { settingsToValidateOptions } from './settingsToValidateOptions.js';
import { calcTextInclusionRanges } from './textValidator.js';
import type { ValidateTextOptions } from './ValidateTextOptions.js';
import type { MappedTextValidationResult, ValidationOptions } from './ValidationTypes.js';

export interface DocumentValidatorOptions extends ValidateTextOptions {
    /**
     * Optional path to a configuration file.
     * If given, it will be used instead of searching for a configuration file.
     */
    configFile?: string;
    /**
     * Prevents searching for local configuration files
     * By default the spell checker looks for configuration files
     * starting at the location of given filename.
     * If `configFile` is defined it will still be loaded instead of searching.
     * `false` will override the value in `settings.noConfigSearch`.
     * @defaultValue undefined
     */
    noConfigSearch?: boolean;
}

const ERROR_NOT_PREPARED = 'Validator Must be prepared before calling this function.';

const skipValidation = false;

export class DocumentValidator {
    private _document: TextDocument;
    private _ready = false;
    readonly errors: Error[] = [];
    private _prepared: Promise<void> | undefined;
    private _preparations: Preparations | undefined;
    private _preparationTime = -1;
    private _suggestions = new AutoCache((text: string) => this.genSuggestions(text), 1000);
    readonly options: DocumentValidatorOptions;

    /**
     * @param doc - Document to validate
     * @param config - configuration to use (not finalized).
     */
    constructor(doc: TextDocument, options: DocumentValidatorOptions, readonly settings: CSpellUserSettings) {
        this._document = doc;
        this.options = { ...options };
        const numSuggestions = this.options.numSuggestions ?? settings.numSuggestions;
        if (numSuggestions !== undefined) {
            this.options.numSuggestions = numSuggestions;
        }
        // console.error(`DocumentValidator: ${doc.uri}`);
    }

    get ready() {
        return this._ready;
    }

    /**
     * Prepare to validate a document.
     * This will load all the necessary configuration and dictionaries.
     *
     * @deprecated
     * @deprecationMessage Use the async `prepare` method.
     */
    prepareSync(): void {
        // @todo
        // Determine doc settings.
        // Calc include ranges
        // Load dictionaries
        if (this._ready) return;

        const timer = createTimer();

        const { options, settings } = this;

        const useSearchForConfig =
            (!options.noConfigSearch && !settings.noConfigSearch) || options.noConfigSearch === false;
        const optionsConfigFile = options.configFile;
        const localConfigFn = optionsConfigFile
            ? () => loadConfigSync(optionsConfigFile, settings)
            : useSearchForConfig
            ? () => searchForDocumentConfigSync(this._document, settings, settings)
            : undefined;

        const localConfig = localConfigFn && wrapCall(localConfigFn, (e) => this.addPossibleError(e))();
        this.addPossibleError(localConfig?.__importRef?.error);

        const config = mergeSettings(settings, localConfig);
        const docSettings = determineTextDocumentSettings(this._document, config);
        const dict = getDictionaryInternalSync(docSettings);

        const matcher = new GlobMatcher(localConfig?.ignorePaths || [], { root: process.cwd(), dot: true });
        const uri = this._document.uri;

        const shouldCheck = !matcher.match(uriToFilePath(uri)) && (docSettings.enabled ?? true);
        const finalSettings = finalizeSettings(docSettings);
        const validateOptions = settingsToValidateOptions(finalSettings);
        const includeRanges = calcTextInclusionRanges(this._document.text, validateOptions);
        const segmenter = createMappedTextSegmenter(includeRanges);
        const textValidator = textValidatorFactory(dict, validateOptions);

        this._preparations = {
            config,
            dictionary: dict,
            docSettings,
            finalSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            textValidator,
            localConfig,
            localConfigFilepath: localConfig?.__importRef?.filename,
        };

        this._ready = true;
        this._preparationTime = timer.elapsed();
        // console.error(`prepareSync ${this._preparationTime.toFixed(2)}ms`);
    }

    async prepare(): Promise<void> {
        if (this._ready) return;
        if (this._prepared) return this._prepared;
        this._prepared = this._prepareAsync();
        return this._prepared;
    }

    private async _prepareAsync(): Promise<void> {
        assert(!this._ready);

        const timer = createTimer();

        const { options, settings } = this;

        const useSearchForConfig =
            (!options.noConfigSearch && !settings.noConfigSearch) || options.noConfigSearch === false;
        const pLocalConfig = options.configFile
            ? loadConfig(options.configFile, settings)
            : useSearchForConfig
            ? searchForDocumentConfig(this._document, settings, settings)
            : undefined;
        const localConfig = (await catchPromiseError(pLocalConfig, (e) => this.addPossibleError(e))) || {};

        this.addPossibleError(localConfig?.__importRef?.error);

        const config = mergeSettings(settings, localConfig);
        const docSettings = determineTextDocumentSettings(this._document, config);
        const dict = await getDictionaryInternal(docSettings);

        const matcher = new GlobMatcher(localConfig?.ignorePaths || [], { root: process.cwd(), dot: true });
        const uri = this._document.uri;

        const shouldCheck = !matcher.match(uriToFilePath(uri)) && (docSettings.enabled ?? true);

        const finalSettings = finalizeSettings(docSettings);
        const validateOptions = settingsToValidateOptions(finalSettings);
        const includeRanges = calcTextInclusionRanges(this._document.text, validateOptions);
        const segmenter = createMappedTextSegmenter(includeRanges);
        const textValidator = textValidatorFactory(dict, validateOptions);

        this._preparations = {
            config,
            dictionary: dict,
            docSettings,
            finalSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            textValidator,
            localConfig,
            localConfigFilepath: localConfig?.__importRef?.filename,
        };

        this._ready = true;
        this._preparationTime = timer.elapsed();
    }

    private _updatePrep() {
        assert(this._preparations, ERROR_NOT_PREPARED);
        const timer = createTimer();
        const prep = this._preparations;
        const docSettings = determineTextDocumentSettings(this._document, prep.config);
        const dict = getDictionaryInternalSync(docSettings);
        const shouldCheck = docSettings.enabled ?? true;
        const finalSettings = finalizeSettings(docSettings);
        const validateOptions = settingsToValidateOptions(finalSettings);
        const includeRanges = calcTextInclusionRanges(this._document.text, validateOptions);
        const segmenter = createMappedTextSegmenter(includeRanges);
        const textValidator = textValidatorFactory(dict, validateOptions);

        this._preparations = {
            ...prep,
            dictionary: dict,
            docSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            textValidator,
        };
        this._preparationTime = timer.elapsed();
    }

    /**
     * The amount of time in ms to prepare for validation.
     */
    get prepTime(): number {
        return this._preparationTime;
    }

    get validateDirectives(): boolean {
        return this.options.validateDirectives ?? this._preparations?.config.validateDirectives ?? false;
    }

    public checkText(range: SimpleRange, _text: string, scope: string[]): ValidationIssue[] {
        const text = this._document.text.slice(range[0], range[1]);
        return this.check({ text, range, scope: scope.join(' ') });
    }

    public check(parsedText: ParsedText): ValidationIssue[] {
        assert(this._ready);
        assert(this._preparations, ERROR_NOT_PREPARED);
        const { segmenter, textValidator } = this._preparations;
        // Determine settings for text range
        // Slice text based upon include ranges
        // Check text against dictionaries.
        const document = this._document;
        let line: TextDocumentLine | undefined = undefined;
        function mapToIssue(issue: MappedTextValidationResult): ValidationIssue {
            const { range, text, isFlagged, isFound } = issue;
            const offset = range[0];
            const length = range[1] - range[0];
            assert(!line || line.offset <= offset);
            if (!line || line.offset + line.text.length <= offset) {
                line = document.lineAt(offset);
            }
            return { text, offset, line, length, isFlagged, isFound };
        }
        const issues = [...pipeSync(segmenter(parsedText), opConcatMap(textValidator.validate), opMap(mapToIssue))];

        if (!this.options.generateSuggestions) {
            return issues;
        }
        const withSugs = issues.map((t) => {
            // lazy suggestion calculation.
            const text = t.text;
            const suggestionsEx = this.getSuggestions(text);
            t.suggestionsEx = suggestionsEx;
            t.suggestions = suggestionsEx.map((s) => s.word);
            return t;
        });

        return withSugs;
    }

    /**
     * Check a Document for Validation Issues.
     * @param forceCheck - force a check even if the document would normally be excluded.
     * @returns the validation issues.
     */
    public async checkDocumentAsync(forceCheck?: boolean): Promise<ValidationIssue[]> {
        await this.prepare();
        return this.checkDocument(forceCheck);
    }

    /**
     * Check a Document for Validation Issues.
     *
     * Note: The validator must be prepared before calling this method.
     * @param forceCheck - force a check even if the document would normally be excluded.
     * @returns the validation issues.
     */
    public checkDocument(forceCheck = false): ValidationIssue[] {
        if (skipValidation) return [];
        assert(this._ready);
        assert(this._preparations, ERROR_NOT_PREPARED);

        const spellingIssues =
            forceCheck || this.shouldCheckDocument() ? [...this._checkParsedText(this._parse())] : [];
        const directiveIssues = this.checkDocumentDirectives();
        // console.log('Stats: %o', this._preparations.textValidator.lineValidator.dict.stats());
        const allIssues = spellingIssues.concat(directiveIssues).sort((a, b) => a.offset - b.offset);
        return allIssues;
    }

    public checkDocumentDirectives(forceCheck = false): ValidationIssue[] {
        assert(this._ready);
        assert(this._preparations, ERROR_NOT_PREPARED);

        const validateDirectives = forceCheck || this.validateDirectives;
        if (!validateDirectives) return [];

        const document = this.document;
        const issueType = IssueType.directive;

        function toValidationIssue(dirIssue: DirectiveIssue): ValidationIssue {
            const { text, range, suggestions, suggestionsEx, message } = dirIssue;
            const offset = range[0];
            const pos = document.positionAt(offset);
            const line = document.getLine(pos.line);
            const issue: ValidationIssue = { text, offset, line, suggestions, suggestionsEx, message, issueType };
            return issue;
        }

        return [...validateInDocumentSettings(this.document.text, this._preparations.config)].map(toValidationIssue);
    }

    get document() {
        return this._document;
    }

    public updateDocumentText(text: string) {
        updateTextDocument(this._document, [{ text }]);
        this._updatePrep();
    }

    private defaultParser(): Iterable<ParsedText> {
        return pipeSync(
            this.document.getLines(),
            opMap((line) => {
                const { text, offset } = line;
                const range = [offset, offset + text.length] as const;
                return { text, range };
            })
        );
    }

    private *_checkParsedText(parsedTexts: Iterable<ParsedText>): Iterable<ValidationIssue> {
        assert(this._preparations, ERROR_NOT_PREPARED);
        const { maxNumberOfProblems = defaultMaxNumberOfProblems, maxDuplicateProblems = defaultMaxDuplicateProblems } =
            this._preparations.validateOptions;

        let numProblems = 0;
        const mapOfProblems = new Map<string, number>();

        for (const pText of parsedTexts) {
            for (const issue of this.check(pText)) {
                const { text } = issue;
                const n = (mapOfProblems.get(text) || 0) + 1;
                mapOfProblems.set(text, n);
                if (n > maxDuplicateProblems) continue;
                yield issue;
                if (++numProblems >= maxNumberOfProblems) return;
            }
        }
    }

    private addPossibleError(error: Error | undefined | unknown): undefined {
        if (!error) return;
        error = this.errors.push(toError(error));
    }

    private _parse(): Iterable<ParsedText> {
        assert(this._preparations, ERROR_NOT_PREPARED);
        const parser = this._preparations.finalSettings.parserFn;
        if (typeof parser !== 'object') return this.defaultParser();
        return parser.parse(this.document.text, this.document.uri.path).parsedTexts;
    }

    private getSuggestions(text: string): ExtendedSuggestion[] {
        return this._suggestions.get(text);
    }

    private genSuggestions(text: string): ExtendedSuggestion[] {
        assert(this._preparations, ERROR_NOT_PREPARED);
        const settings = this._preparations.docSettings;
        const dict = this._preparations.dictionary;
        const sugOptions = {
            compoundMethod: 0,
            numSuggestions: this.options.numSuggestions,
            includeTies: false,
            ignoreCase: !(settings.caseSensitive ?? false),
            timeout: settings.suggestionsTimeout,
            numChanges: settings.suggestionNumChanges,
        };

        const locale = this._preparations.config.language;
        const rawSuggestions = dict.suggest(text, sugOptions);
        const sugsWithAlt = calcSuggestionAdjustedToToMatchCase(
            text,
            rawSuggestions,
            locale,
            sugOptions.ignoreCase,
            dict
        );

        return sugsWithAlt.map(sanitizeSuggestion);
    }

    public getFinalizedDocSettings(): CSpellSettingsInternal {
        assert(this._ready);
        assert(this._preparations, ERROR_NOT_PREPARED);
        return this._preparations.docSettings;
    }

    /**
     * Returns true if the final result of the configuration calculation results
     * in the document being enabled. Note: in some cases, checking the document
     * might still make sense, for example, the `@cspell/eslint-plugin` relies on
     * `eslint` configuration to make that determination.
     * @returns true if the document settings have resolved to be `enabled`
     */
    public shouldCheckDocument(): boolean {
        assert(this._preparations, ERROR_NOT_PREPARED);
        return this._preparations.shouldCheck;
    }

    /**
     * Internal `cspell-lib` use.
     */
    public _getPreparations(): Preparations | undefined {
        return this._preparations;
    }
}

function sanitizeSuggestion(sug: WordSuggestion): ExtendedSuggestion {
    const { word, isPreferred, wordAdjustedToMatchCase } = sug;
    if (isPreferred && wordAdjustedToMatchCase) return { word, wordAdjustedToMatchCase, isPreferred };
    if (isPreferred) return { word, isPreferred };
    if (wordAdjustedToMatchCase) return { word, wordAdjustedToMatchCase };
    return { word };
}

interface Preparations {
    /** loaded config */
    config: CSpellSettingsInternal;
    dictionary: SpellingDictionaryCollection;
    /** configuration after applying in-doc settings */
    docSettings: CSpellSettingsInternal;
    finalSettings: CSpellSettingsInternalFinalized;
    includeRanges: MatchRange[];
    textValidator: TextValidator;
    segmenter: (texts: MappedText) => Iterable<MappedText>;
    shouldCheck: boolean;
    validateOptions: ValidationOptions;
    localConfig: CSpellUserSettings | undefined;
    localConfigFilepath: string | undefined;
}

async function searchForDocumentConfig(
    document: TextDocumentRef,
    defaultConfig: CSpellSettingsWithSourceTrace,
    pnpSettings: PnPSettings
): Promise<CSpellSettingsWithSourceTrace> {
    const { uri } = document;
    if (uri.scheme !== 'file') return Promise.resolve(defaultConfig);
    return searchForConfig(path.dirname(uriToFilePath(uri)), pnpSettings).then((s) => s || defaultConfig);
}

function searchForDocumentConfigSync(
    document: TextDocumentRef,
    defaultConfig: CSpellSettingsWithSourceTrace,
    pnpSettings: PnPSettings
): CSpellSettingsWithSourceTrace {
    const { uri } = document;
    if (uri.scheme !== 'file') defaultConfig;
    return searchForConfigSync(uriToFilePath(uri), pnpSettings) || defaultConfig;
}

interface ShouldCheckDocumentResult {
    errors: Error[];
    shouldCheck: boolean;
}

export async function shouldCheckDocument(
    doc: TextDocumentRef,
    options: DocumentValidatorOptions,
    settings: CSpellUserSettings
): Promise<ShouldCheckDocumentResult> {
    const errors: Error[] = [];

    function addPossibleError(error: Error | undefined | unknown): undefined {
        if (!error) return undefined;
        error = errors.push(toError(error));
        return undefined;
    }

    async function shouldCheck(): Promise<boolean> {
        const useSearchForConfig =
            (!options.noConfigSearch && !settings.noConfigSearch) || options.noConfigSearch === false;
        const pLocalConfig = options.configFile
            ? loadConfig(options.configFile, settings)
            : useSearchForConfig
            ? searchForDocumentConfig(doc, settings, settings)
            : undefined;

        const localConfig = (await catchPromiseError(pLocalConfig, addPossibleError)) || {};

        addPossibleError(localConfig?.__importRef?.error);

        const config = mergeSettings(settings, localConfig);
        const matcher = new GlobMatcher(localConfig?.ignorePaths || [], { root: process.cwd(), dot: true });
        const docSettings = determineTextDocumentSettings(doc, config);
        const uri = doc.uri;
        return !matcher.match(uriToFilePath(uri)) && (docSettings.enabled ?? true);
    }

    return { errors, shouldCheck: await shouldCheck() };
}

export const __testing__ = {
    sanitizeSuggestion,
};
