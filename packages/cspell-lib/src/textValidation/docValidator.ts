import type { CSpellSettingsWithSourceTrace, CSpellUserSettings, PnPSettings } from '@cspell/cspell-types';
import assert from 'assert';
import { CSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef';
import { TextDocument } from '../Models/TextDocument';
import { loadConfig, mergeSettings, searchForConfig } from '../Settings';
import { getDictionaryInternal } from '../SpellingDictionary';
import { MatchRange } from '../util/TextRange';
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

    /**
     * @param doc - Document to validate
     * @param config - configuration to use (not finalized).
     */
    constructor(doc: TextDocument, readonly options: DocumentValidatorOptions, readonly settings: CSpellUserSettings) {
        this._document = doc;
    }

    get ready() {
        return this._ready;
    }

    prepareSync() {
        // @todo
        // Determine doc settings.
        // Calc include ranges
        // Load dictionaries
        this._ready = true;
    }

    async prepare(): Promise<void> {
        if (this._ready) return;
        if (this._prepared) return this._prepared;
        this._prepared = this._prepareAsync();
        return this._prepared;
    }

    private async _prepareAsync(): Promise<void> {
        assert(!this._ready);

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
        const includeRanges = calcTextInclusionRanges(this._document.text, docSettings);
        const segmenter = mapLineSegmentAgainstRangesFactory(includeRanges);
        const lineValidator = lineValidatorFactory(dict, validateOptions);

        this._preparations = {
            docSettings,
            shouldCheck,
            validateOptions,
            includeRanges,
            segmenter,
            lineValidator,
        };

        this._ready = true;
    }

    checkText(range: SimpleRange, _text: string, _scope: string[]): ValidationIssue[] {
        assert(this._ready);
        assert(this._preparations);
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
        return [...this._preparations.lineValidator(lineSeg)];
    }

    get document() {
        return this._document;
    }

    private addPossibleError(error: Error | undefined) {
        if (!error) return;
        this.errors.push(error);
    }

    private catchError<P>(p: Promise<P>): Promise<P | undefined> {
        return p.catch((error) => {
            this.addPossibleError(error);
            return undefined;
        });
    }
}

export type Offset = number;

export type SimpleRange = readonly [Offset, Offset];

interface Preparations {
    docSettings: CSpellSettingsInternal;
    shouldCheck: boolean;
    validateOptions: ValidationOptions;
    includeRanges: MatchRange[];
    segmenter: (lineSegment: LineSegment) => LineSegment[];
    lineValidator: LineValidator;
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
