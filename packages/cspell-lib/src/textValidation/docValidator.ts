import { opConcatMap, opMap, pipeSync } from '@cspell/cspell-pipe';
import type { CSpellSettingsWithSourceTrace, CSpellUserSettings, ParsedText, PnPSettings } from '@cspell/cspell-types';
import assert from 'assert';
import { GlobMatcher } from 'cspell-glob';
import { CSpellSettingsInternal, CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef';
import { TextDocument, updateTextDocument } from '../Models/TextDocument';
import { finalizeSettings, loadConfig, mergeSettings, searchForConfig } from '../Settings';
import { loadConfigSync, searchForConfigSync } from '../Settings/configLoader';
import { getDictionaryInternal, getDictionaryInternalSync, SpellingDictionaryCollection } from '../SpellingDictionary';
import { toError } from '../util/errors';
import { callOnce } from '../util/Memorizer';
import { AutoCache } from '../util/simpleCache';
import { MatchRange } from '../util/TextRange';
import { createTimer } from '../util/timer';
import { clean } from '../util/util';
import { determineTextDocumentSettings } from './determineTextDocumentSettings';
import { SimpleRange } from './parsedText';
import {
    calcTextInclusionRanges,
    defaultMaxDuplicateProblems,
    defaultMaxNumberOfProblems,
    LineValidator,
    lineValidatorFactory,
    mapLineSegmentAgainstRangesFactory,
    ValidationOptions,
    type LineSegment,
} from './textValidator';
import { settingsToValidateOptions, ValidateTextOptions, ValidationIssue } from './validator';

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

export class DocumentValidator {
    private _document: TextDocument;
    private _ready = false;
    readonly errors: Error[] = [];
    private _prepared: Promise<void> | undefined;
    private _preparations: Preparations | undefined;
    private _preparationTime = -1;
    private _suggestions = new AutoCache((text: string) => this.genSuggestions(text), 1000);

    /**
     * @param doc - Document to validate
     * @param config - configuration to use (not finalized).
     */
    constructor(doc: TextDocument, readonly options: DocumentValidatorOptions, readonly settings: CSpellUserSettings) {
        this._document = doc;
        // console.error(`DocumentValidator: ${doc.uri}`);
    }

    get ready() {
        return this._ready;
    }

    prepareSync() {
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
        const localConfig = optionsConfigFile
            ? this.errorCatcherWrapper(() => loadConfigSync(optionsConfigFile, settings))
            : useSearchForConfig
            ? this.errorCatcherWrapper(() => searchForDocumentConfigSync(this._document, settings, settings))
            : undefined;

        this.addPossibleError(localConfig?.__importRef?.error);

        const config = mergeSettings(settings, localConfig);
        const docSettings = determineTextDocumentSettings(this._document, config);
        const dict = getDictionaryInternalSync(docSettings);

        const matcher = new GlobMatcher(localConfig?.ignorePaths || [], { root: process.cwd(), dot: true });
        const uri = this._document.uri;

        const shouldCheck = !matcher.match(uri.fsPath) && (docSettings.enabled ?? true);
        const finalSettings = finalizeSettings(docSettings);
        const validateOptions = settingsToValidateOptions(finalSettings);
        const includeRanges = calcTextInclusionRanges(this._document.text, validateOptions);
        const segmenter = mapLineSegmentAgainstRangesFactory(includeRanges);
        const lineValidator = lineValidatorFactory(dict, validateOptions);

        this._preparations = {
            config,
            dictionary: dict,
            docSettings,
            finalSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            lineValidator,
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
            ? this.catchError(loadConfig(options.configFile, settings))
            : useSearchForConfig
            ? this.catchError(searchForDocumentConfig(this._document, settings, settings))
            : undefined;
        const localConfig = (await pLocalConfig) || {};

        this.addPossibleError(localConfig?.__importRef?.error);

        const config = mergeSettings(settings, localConfig);
        const docSettings = determineTextDocumentSettings(this._document, config);
        const dict = await getDictionaryInternal(docSettings);

        const matcher = new GlobMatcher(localConfig?.ignorePaths || [], { root: process.cwd(), dot: true });
        const uri = this._document.uri;

        const shouldCheck = !matcher.match(uri.fsPath) && (docSettings.enabled ?? true);

        const finalSettings = finalizeSettings(docSettings);
        const validateOptions = settingsToValidateOptions(finalSettings);
        const includeRanges = calcTextInclusionRanges(this._document.text, validateOptions);
        const segmenter = mapLineSegmentAgainstRangesFactory(includeRanges);
        const lineValidator = lineValidatorFactory(dict, validateOptions);

        this._preparations = {
            config,
            dictionary: dict,
            docSettings,
            finalSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            lineValidator,
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
        const segmenter = mapLineSegmentAgainstRangesFactory(includeRanges);
        const lineValidator = lineValidatorFactory(dict, validateOptions);

        this._preparations = {
            ...prep,
            dictionary: dict,
            docSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            lineValidator,
        };
        this._preparationTime = timer.elapsed();
    }

    /**
     * The amount of time in ms to prepare for validation.
     */
    get prepTime(): number {
        return this._preparationTime;
    }

    checkText(range: SimpleRange, _text: string, scope: string[]): ValidationIssue[] {
        const text = this._document.text.slice(range[0], range[1]);
        return this.check({ text, range, scope: scope.join(' ') });
    }

    check(parsedText: ParsedText): ValidationIssue[] {
        assert(this._ready);
        assert(this._preparations, ERROR_NOT_PREPARED);
        const { range, text } = parsedText;
        const { segmenter, lineValidator } = this._preparations;
        // Determine settings for text range
        // Slice text based upon include ranges
        // Check text against dictionaries.
        const offset = range[0];
        const line = this._document.lineAt(offset);
        const lineSeg: LineSegment = {
            line,
            segment: {
                text,
                offset,
            },
        };
        const aIssues = pipeSync(segmenter(lineSeg), opConcatMap(lineValidator));
        const issues = [...aIssues];

        if (!this.options.generateSuggestions) {
            return issues;
        }
        const withSugs = issues.map((t) => {
            // lazy suggestion calculation.
            const text = t.text;
            const suggestions = callOnce(() => this.suggest(text));
            return Object.defineProperty({ ...t }, 'suggestions', { enumerable: true, get: suggestions });
        });

        return withSugs;
    }

    checkDocument(forceCheck = false): ValidationIssue[] {
        assert(this._ready);
        assert(this._preparations, ERROR_NOT_PREPARED);

        return forceCheck || this.shouldCheckDocument() ? [...this._checkParsedText(this._parse())] : [];
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

    private addPossibleError(error: Error | undefined | unknown) {
        if (!error) return;
        error = this.errors.push(toError(error));
    }

    private catchError<P>(p: Promise<P>): Promise<P | undefined> {
        return p.catch((error) => {
            this.addPossibleError(error);
            return undefined;
        });
    }
    private errorCatcherWrapper<P>(fn: () => P): P | undefined {
        try {
            return fn();
        } catch (error) {
            this.addPossibleError(error);
        }
        return undefined;
    }

    private _parse(): Iterable<ParsedText> {
        assert(this._preparations, ERROR_NOT_PREPARED);
        const parser = this._preparations.finalSettings.parser;
        if (typeof parser !== 'object') return this.defaultParser();
        return parser.parse(this.document.text, this.document.uri.path).parsedTexts;
    }

    private suggest(text: string) {
        return this._suggestions.get(text);
    }

    private genSuggestions(text: string): string[] {
        assert(this._preparations, ERROR_NOT_PREPARED);
        const settings = this._preparations.docSettings;
        const dict = this._preparations.dictionary;
        const sugOptions = clean({
            compoundMethod: 0,
            numSuggestions: this.options.numSuggestions,
            includeTies: false,
            ignoreCase: !(settings.caseSensitive ?? false),
            timeout: settings.suggestionsTimeout,
            numChanges: settings.suggestionNumChanges,
        });
        return dict.suggest(text, sugOptions).map((r) => r.word);
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

interface Preparations {
    /** loaded config */
    config: CSpellSettingsInternal;
    dictionary: SpellingDictionaryCollection;
    /** configuration after applying in-doc settings */
    docSettings: CSpellSettingsInternal;
    finalSettings: CSpellSettingsInternalFinalized;
    includeRanges: MatchRange[];
    lineValidator: LineValidator;
    segmenter: (lineSegment: LineSegment) => LineSegment[];
    shouldCheck: boolean;
    validateOptions: ValidationOptions;
    localConfig: CSpellUserSettings | undefined;
    localConfigFilepath: string | undefined;
}

async function searchForDocumentConfig(
    document: TextDocument,
    defaultConfig: CSpellSettingsWithSourceTrace,
    pnpSettings: PnPSettings
): Promise<CSpellSettingsWithSourceTrace> {
    const { uri } = document;
    if (uri.scheme !== 'file') return Promise.resolve(defaultConfig);
    return searchForConfig(uri.fsPath, pnpSettings).then((s) => s || defaultConfig);
}

function searchForDocumentConfigSync(
    document: TextDocument,
    defaultConfig: CSpellSettingsWithSourceTrace,
    pnpSettings: PnPSettings
): CSpellSettingsWithSourceTrace {
    const { uri } = document;
    if (uri.scheme !== 'file') defaultConfig;
    return searchForConfigSync(uri.fsPath, pnpSettings) || defaultConfig;
}
