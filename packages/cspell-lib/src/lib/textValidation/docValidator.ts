import assert from 'node:assert';

import { opConcatMap, opMap, pipeSync } from '@cspell/cspell-pipe/sync';
import type {
    CSpellSettingsWithSourceTrace,
    CSpellUserSettings,
    MappedText,
    ParsedText,
    PnPSettings,
} from '@cspell/cspell-types';
import { IssueType } from '@cspell/cspell-types';

import { getGlobMatcherForExcluding } from '../globs/getGlobMatcher.js';
import type { CSpellSettingsInternal, CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef.js';
import type { ExtendedSuggestion } from '../Models/Suggestion.js';
import type { TextDocument, TextDocumentLine, TextDocumentRef } from '../Models/TextDocument.js';
import { updateTextDocument } from '../Models/TextDocument.js';
import type { ValidationIssue } from '../Models/ValidationIssue.js';
import { createPerfTimer } from '../perf/index.js';
import { finalizeSettings, loadConfig, mergeSettings, searchForConfig } from '../Settings/index.js';
import type { DirectiveIssue } from '../Settings/InDocSettings.js';
import { validateInDocumentSettings } from '../Settings/InDocSettings.js';
import type { SpellingDictionaryCollection, SuggestionResult } from '../SpellingDictionary/index.js';
import { getDictionaryInternal } from '../SpellingDictionary/index.js';
import type { WordSuggestion } from '../suggestions.js';
import { calcSuggestionAdjustedToToMatchCase } from '../suggestions.js';
import { catchPromiseError, toError } from '../util/errors.js';
import { AutoCache } from '../util/simpleCache.js';
import type { MatchRange } from '../util/TextRange.js';
import { uriToFilePath } from '../util/Uri.js';
import { defaultMaxDuplicateProblems, defaultMaxNumberOfProblems } from './defaultConstants.js';
import { determineTextDocumentSettings } from './determineTextDocumentSettings.js';
import type { TextValidator } from './lineValidatorFactory.js';
import { textValidatorFactory } from './lineValidatorFactory.js';
import type { SimpleRange } from './parsedText.js';
import { createMappedTextSegmenter } from './parsedText.js';
import { settingsToValidateOptions } from './settingsToValidateOptions.js';
import { calcTextInclusionRanges } from './textValidator.js';
import { traceWord } from './traceWord.js';
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

type PerfTimings = Record<string, number>;

export class DocumentValidator {
    private _document: TextDocument;
    private _ready = false;
    readonly errors: Error[] = [];
    private _prepared: Promise<void> | undefined;
    private _preparations: Preparations | undefined;
    private _preparationTime = -1;
    private _suggestions = new AutoCache((text: string) => this.genSuggestions(text), 1000);
    readonly options: DocumentValidatorOptions;
    readonly perfTiming: PerfTimings = {};
    public skipValidation: boolean;

    /**
     * @param doc - Document to validate
     * @param config - configuration to use (not finalized).
     */
    constructor(
        doc: TextDocument,
        options: DocumentValidatorOptions,
        readonly settings: CSpellUserSettings,
    ) {
        this._document = doc;
        this.options = { ...options };
        const numSuggestions = this.options.numSuggestions ?? settings.numSuggestions;
        if (numSuggestions !== undefined) {
            this.options.numSuggestions = numSuggestions;
        }
        this.skipValidation = !!options.skipValidation;
        // console.error(`DocumentValidator: ${doc.uri}`);
    }

    get ready() {
        return this._ready;
    }

    prepare(): Promise<void> {
        if (this._ready) return Promise.resolve();
        if (this._prepared) return this._prepared;
        this._prepared = this._prepareAsync();
        return this._prepared;
    }

    private async _prepareAsync(): Promise<void> {
        assert(!this._ready);

        const timer = createPerfTimer('_prepareAsync');

        const { options, settings } = this;

        const useSearchForConfig =
            (!options.noConfigSearch && !settings.noConfigSearch) || options.noConfigSearch === false;
        const pLocalConfig = options.configFile
            ? loadConfig(options.configFile, settings)
            : useSearchForConfig
              ? timePromise(
                    this.perfTiming,
                    '__searchForDocumentConfig',
                    searchForDocumentConfig(this._document, settings, settings),
                )
              : undefined;
        pLocalConfig && timePromise(this.perfTiming, '_loadConfig', pLocalConfig);
        const localConfig = (await catchPromiseError(pLocalConfig, (e) => this.addPossibleError(e))) || {};

        this.addPossibleError(localConfig?.__importRef?.error);

        const config = mergeSettings(settings, localConfig);
        const docSettings = await timePromise(
            this.perfTiming,
            '_determineTextDocumentSettings',
            determineTextDocumentSettings(this._document, config),
        );
        const dict = await timePromise(this.perfTiming, '_getDictionaryInternal', getDictionaryInternal(docSettings));

        const recGlobMatcherTime = recordPerfTime(this.perfTiming, '_GlobMatcher');
        const matcher = getGlobMatcherForExcluding(localConfig?.ignorePaths);
        const uri = this._document.uri;
        recGlobMatcherTime();
        const recShouldCheckTime = recordPerfTime(this.perfTiming, '_shouldCheck');

        // eslint-disable-next-line unicorn/prefer-regexp-test
        const shouldCheck = !matcher.match(uriToFilePath(uri)) && (docSettings.enabled ?? true);

        recShouldCheckTime();

        const recFinalizeTime = recordPerfTime(this.perfTiming, '_finalizeSettings');

        const finalSettings = finalizeSettings(docSettings);
        const validateOptions = settingsToValidateOptions(finalSettings);
        const includeRanges = calcTextInclusionRanges(this._document.text, validateOptions);
        const segmenter = createMappedTextSegmenter(includeRanges);
        const textValidator = textValidatorFactory(dict, validateOptions);

        recFinalizeTime();

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
        this._preparationTime = timer.elapsed;
        this.perfTiming.prepTime = this._preparationTime;
    }

    private async _updatePrep() {
        assert(this._preparations, ERROR_NOT_PREPARED);
        const timer = createPerfTimer('_updatePrep');
        const prep = this._preparations;
        const docSettings = await determineTextDocumentSettings(this._document, prep.config);
        const dict = await getDictionaryInternal(docSettings);
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
        this._preparationTime = timer.elapsed;
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
            const { range, text, isFlagged, isFound, suggestionsEx } = issue;
            const offset = range[0];
            const length = range[1] - range[0];
            assert(!line || line.offset <= offset);
            if (!line || line.offset + line.text.length <= offset) {
                line = document.lineAt(offset);
            }
            return { text, offset, line, length, isFlagged, isFound, suggestionsEx };
        }
        const issues = [...pipeSync(segmenter(parsedText), opConcatMap(textValidator.validate), opMap(mapToIssue))];

        if (!this.options.generateSuggestions) {
            return issues.map((issue) => {
                if (!issue.suggestionsEx) return issue;
                const suggestionsEx = this.adjustSuggestions(issue.text, issue.suggestionsEx);
                const suggestions = suggestionsEx.map((s) => s.word);
                return { ...issue, suggestionsEx, suggestions };
            });
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
        const timerDone = recordPerfTime(this.perfTiming, 'checkDocument');
        try {
            if (this.skipValidation) return [];
            assert(this._ready);
            assert(this._preparations, ERROR_NOT_PREPARED);

            const spellingIssues =
                forceCheck || this.shouldCheckDocument() ? [...this._checkParsedText(this._parse())] : [];
            const directiveIssues = this.checkDocumentDirectives();
            // console.log('Stats: %o', this._preparations.textValidator.lineValidator.dict.stats());
            const allIssues = [...spellingIssues, ...directiveIssues].sort((a, b) => a.offset - b.offset);
            return allIssues;
        } finally {
            timerDone();
        }
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

    public async updateDocumentText(text: string) {
        updateTextDocument(this._document, [{ text }]);
        await this._updatePrep();
    }

    /**
     * Get the calculated ranges of text that should be included in the spell checking.
     * @returns MatchRanges of text to include.
     */
    public getCheckedTextRanges(): MatchRange[] {
        assert(this._preparations, ERROR_NOT_PREPARED);
        return this._preparations.includeRanges;
    }

    public traceWord(word: string) {
        assert(this._preparations, ERROR_NOT_PREPARED);
        return traceWord(word, this._preparations.dictionary, this._preparations.config);
    }

    private defaultParser(): Iterable<ParsedText> {
        return pipeSync(
            this.document.getLines(),
            opMap((line) => {
                const { text, offset } = line;
                const range = [offset, offset + text.length] as const;
                return { text, range };
            }),
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

        const rawSuggestions = dict.suggest(text, sugOptions);
        return this.adjustSuggestions(text, rawSuggestions);
    }

    private adjustSuggestions(
        text: string,
        rawSuggestions: (ExtendedSuggestion | SuggestionResult)[],
    ): ExtendedSuggestion[] {
        assert(this._preparations, ERROR_NOT_PREPARED);
        const settings = this._preparations.docSettings;
        const ignoreCase = !(settings.caseSensitive ?? false);
        const locale = this._preparations.config.language;
        const dict = this._preparations.dictionary;
        const sugsWithAlt = calcSuggestionAdjustedToToMatchCase(
            text,
            rawSuggestions.map(mapSug),
            locale,
            ignoreCase,
            dict,
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
    pnpSettings: PnPSettings,
): Promise<CSpellSettingsWithSourceTrace> {
    const { uri } = document;
    if (uri.scheme !== 'file') return defaultConfig;
    return searchForConfig(uri.toString(), pnpSettings).then((s) => s || defaultConfig);
}

function mapSug(sug: ExtendedSuggestion | SuggestionResult): SuggestionResult {
    return { cost: 999, ...sug };
}

interface ShouldCheckDocumentResult {
    errors: Error[];
    shouldCheck: boolean;
}

export async function shouldCheckDocument(
    doc: TextDocumentRef,
    options: DocumentValidatorOptions,
    settings: CSpellUserSettings,
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
        const matcher = getGlobMatcherForExcluding(localConfig?.ignorePaths);
        const docSettings = await determineTextDocumentSettings(doc, config);
        const uri = doc.uri;
        // eslint-disable-next-line unicorn/prefer-regexp-test
        return !matcher.match(uriToFilePath(uri)) && (docSettings.enabled ?? true);
    }

    return { errors, shouldCheck: await shouldCheck() };
}

export const __testing__ = {
    sanitizeSuggestion,
};

function recordPerfTime(timings: PerfTimings, name: string): () => void {
    const timer = createPerfTimer(name, (elapsed) => (timings[name] = elapsed));
    return () => timer.end();
}

function timePromise<T>(timings: PerfTimings, name: string, p: Promise<T>): Promise<T> {
    return p.finally(recordPerfTime(timings, name));
}
