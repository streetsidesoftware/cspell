import { opConcatMap, pipeSync } from '@cspell/cspell-pipe';
import type { CSpellSettingsWithSourceTrace, CSpellUserSettings, PnPSettings } from '@cspell/cspell-types';
import assert from 'assert';
import { CSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef';
import { TextDocument } from '../Models/TextDocument';
import { finalizeSettings, loadConfig, mergeSettings, searchForConfig } from '../Settings';
import { loadConfigSync, searchForConfigSync } from '../Settings/configLoader';
import { getDictionaryInternal, getDictionaryInternalSync, SpellingDictionaryCollection } from '../SpellingDictionary';
import { toError } from '../util/errors';
import { MatchRange } from '../util/TextRange';
import { createTimer } from '../util/timer';
import { clean } from '../util/util';
import { determineTextDocumentSettings } from './determineTextDocumentSettings';
import {
    calcTextInclusionRanges,
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

export class DocumentValidator {
    private _document: TextDocument;
    private _ready = false;
    readonly errors: Error[] = [];
    private _prepared: Promise<void> | undefined;
    private _preparations: Preparations | undefined;
    private _preparationTime = -1;

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

        const config = localConfig ? mergeSettings(settings, localConfig) : settings;
        const docSettings = determineTextDocumentSettings(this._document, config);
        const dict = getDictionaryInternalSync(docSettings);

        const shouldCheck = docSettings.enabled ?? true;
        const validateOptions = settingsToValidateOptions(docSettings);
        const finalSettings = finalizeSettings(docSettings);
        const includeRanges = calcTextInclusionRanges(this._document.text, finalSettings);
        const segmenter = mapLineSegmentAgainstRangesFactory(includeRanges);
        const lineValidator = lineValidatorFactory(dict, validateOptions);

        this._preparations = {
            dictionary: dict,
            docSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            lineValidator,
        };

        this._ready = true;
        this._preparationTime = timer.elapsed();
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
        const localConfig = await pLocalConfig;

        this.addPossibleError(localConfig?.__importRef?.error);

        const config = localConfig ? mergeSettings(settings, localConfig) : settings;
        const docSettings = determineTextDocumentSettings(this._document, config);
        const dict = await getDictionaryInternal(docSettings);

        const shouldCheck = docSettings.enabled ?? true;
        const validateOptions = settingsToValidateOptions(docSettings);
        const finalSettings = finalizeSettings(docSettings);
        const includeRanges = calcTextInclusionRanges(this._document.text, finalSettings);
        const segmenter = mapLineSegmentAgainstRangesFactory(includeRanges);
        const lineValidator = lineValidatorFactory(dict, validateOptions);

        this._preparations = {
            dictionary: dict,
            docSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            lineValidator,
        };

        this._ready = true;
        this._preparationTime = timer.elapsed();
    }

    /**
     * The amount of time in ms to prepare for validation.
     */
    get prepTime(): number {
        return this._preparationTime;
    }

    checkText(range: SimpleRange, _text: string, _scope: string[]): ValidationIssue[] {
        assert(this._ready);
        assert(this._preparations);
        const { segmenter, lineValidator } = this._preparations;
        // Determine settings for text range
        // Slice text based upon include ranges
        // Check text against dictionaries.
        const offset = range[0];
        const offsetEnd = range[1];
        const text = this._document.text.slice(offset, offsetEnd);
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
        const withSugs = issues.map((t) => {
            const suggestions = dict.suggest(t.text, sugOptions).map((r) => r.word);
            return { ...t, suggestions };
        });

        return withSugs;
    }

    get document() {
        return this._document;
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
}

export type Offset = number;

export type SimpleRange = readonly [Offset, Offset];

interface Preparations {
    dictionary: SpellingDictionaryCollection;
    docSettings: CSpellSettingsInternal;
    includeRanges: MatchRange[];
    lineValidator: LineValidator;
    segmenter: (lineSegment: LineSegment) => LineSegment[];
    shouldCheck: boolean;
    validateOptions: ValidationOptions;
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
