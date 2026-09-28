import type { CSpellUserSettings, MappedText } from '@cspell/cspell-types';

import type { CSpellSettingsInternal, CSpellSettingsInternalFinalized } from '../Settings/index.js';
import type { SpellingDictionaryCollection } from '../SpellingDictionary/index.js';
import type { MatchRange, TextTransformer } from '../Transform/index.js';
import { createMappedTextSegmenter } from '../Transform/index.js';
import type { TextValidationFactoryOptions, TextValidator } from './lineValidatorFactory.js';

/**
 * What a `DocumentValidator` needs to spell check its document.
 */
export interface Preparations {
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
    validateOptions: TextValidationFactoryOptions;
    localConfig: CSpellUserSettings | undefined;
    localConfigFilepath: string | undefined;
    transformer: TextTransformer;
}

/**
 * The preparations that depend on the document's settings. They are replaced when the document changes.
 */
export interface DocumentSettingsPreparations {
    dictionary: SpellingDictionaryCollection;
    /** configuration after applying in-doc settings */
    docSettings: CSpellSettingsInternal;
    finalSettings: CSpellSettingsInternalFinalized;
    shouldCheck: boolean;
    validateOptions: TextValidationFactoryOptions;
    textValidator: TextValidator;
    transformer: TextTransformer;
    /**
     * Runs every ignore pattern over the whole document, so it is only called once the include ranges are needed.
     */
    calcIncludeRanges: () => MatchRange[];
}

/**
 * The include ranges, and the segmenter built from them, are calculated on first use. A document that
 * is never checked never pays for them.
 */
export class DocumentValidatorPreparations implements Preparations {
    dictionary: SpellingDictionaryCollection;
    /** configuration after applying in-doc settings */
    docSettings: CSpellSettingsInternal;
    finalSettings: CSpellSettingsInternalFinalized;
    shouldCheck: boolean;
    validateOptions: TextValidationFactoryOptions;
    textValidator: TextValidator;
    transformer: TextTransformer;
    #calcIncludeRanges: () => MatchRange[];
    #includeRanges: MatchRange[] | undefined;
    #segmenter: ((texts: MappedText) => Iterable<MappedText>) | undefined;

    /**
     * @param config - loaded config
     * @param localConfig - the config file found for the document, if any.
     * @param localConfigFilepath - the path of `localConfig`.
     * @param prep - the preparations that depend on the document's settings.
     */
    constructor(
        readonly config: CSpellSettingsInternal,
        readonly localConfig: CSpellUserSettings | undefined,
        readonly localConfigFilepath: string | undefined,
        prep: DocumentSettingsPreparations,
    ) {
        this.dictionary = prep.dictionary;
        this.docSettings = prep.docSettings;
        this.finalSettings = prep.finalSettings;
        this.shouldCheck = prep.shouldCheck;
        this.validateOptions = prep.validateOptions;
        this.textValidator = prep.textValidator;
        this.transformer = prep.transformer;
        this.#calcIncludeRanges = prep.calcIncludeRanges;
    }

    /**
     * Replace the preparations that depend on the document's settings. The include ranges are
     * calculated again on next use.
     */
    update(prep: DocumentSettingsPreparations): void {
        this.dictionary = prep.dictionary;
        this.docSettings = prep.docSettings;
        this.finalSettings = prep.finalSettings;
        this.shouldCheck = prep.shouldCheck;
        this.validateOptions = prep.validateOptions;
        this.textValidator = prep.textValidator;
        this.transformer = prep.transformer;
        this.#calcIncludeRanges = prep.calcIncludeRanges;
        this.#includeRanges = undefined;
        this.#segmenter = undefined;
    }

    get includeRanges(): MatchRange[] {
        return (this.#includeRanges ??= this.#calcIncludeRanges());
    }

    get segmenter(): (texts: MappedText) => Iterable<MappedText> {
        return (this.#segmenter ??= createMappedTextSegmenter(this.includeRanges));
    }
}
