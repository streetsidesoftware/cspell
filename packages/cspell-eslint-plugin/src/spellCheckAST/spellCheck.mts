// cspell:ignore TSESTree
import assert from 'node:assert';
import * as path from 'node:path';

import { toFileDirURL, toFileURL } from '@cspell/url';
import type { CSpellSettings, TextDocument, UnknownWordsChoices, ValidationIssue } from 'cspell-lib';
import {
    createTextDocument,
    DocumentValidator,
    extractImportErrors,
    getDictionary,
    refreshDictionaryCache,
} from 'cspell-lib';

import { getDefaultLogger } from '../common/logger.cjs';
import type { CustomWordListFile, Options } from '../common/options.cjs';

export type SpellCheckOptions = Options & { cwd: string };

interface ExtendedSuggestion {
    /**
     * The suggestion.
     */
    word: string;
    /**
     * The word is preferred above others, except other "preferred" words.
     */
    isPreferred?: boolean;
    /**
     * The suggested word adjusted to match the original case.
     */
    wordAdjustedToMatchCase?: string;
}

export type Suggestions = ExtendedSuggestion[] | undefined;

export interface SpellCheckIssue {
    /** the starting offset of the issue */
    start: number;
    /** the ending offset of the issue */
    end: number;
    /** the word that was flagged */
    word: string;
    /** the severity of the issue. */
    severity: 'Forbidden' | 'Misspelled' | 'Unknown' | 'Hint';
    /** suggestions to be presented. */
    suggestions: Suggestions;
    /** Indicates that there preferred suggestions. */
    hasPreferredFixes: boolean;
    /** Indicates that there are simple suggestions available. */
    hasSimpleSuggestions: boolean;
    /** The range of text in which this issue occurred. */
    range: CheckTextRange;
    /** The index of the range in which this issues occurred. */
    rangeIdx: number;
}

export interface SpellCheckResults {
    issues: SpellCheckIssue[];
    errors?: Error[];
}

export type CheckTextRange = readonly [number, number];

export type SpellCheckFn = typeof spellCheck;

export type SpellCheckSyncFn = (...p: Parameters<SpellCheckFn>) => Awaited<ReturnType<SpellCheckFn>>;

const defaultSettings: CSpellSettings = {
    name: 'eslint-configuration-file',
    patterns: [
        // @todo: be able to use cooked / transformed strings.
        // {
        //     // Do not block unicode escape sequences.
        //     name: 'js-unicode-escape',
        //     pattern: /$^/g,
        // },
    ],
};

const isDebugModeExtended = false;
const forceLogging = false;

const knownConfigErrors = new Set<string>();

export async function spellCheck(
    filename: string,
    text: string,
    ranges: CheckTextRange[],
    options: SpellCheckOptions,
): Promise<SpellCheckResults> {
    const logger = getDefaultLogger();
    const debugMode = forceLogging || options.debugMode || false;
    logger.enabled = forceLogging || (options.debugMode ?? (logger.enabled || isDebugModeExtended));
    const log = logger.log;
    const filterIssues = generateReportingPredicate(options.report);

    log('options: %o', options);

    const validator = getDocValidator(filename, text, options);
    await validator.prepare();

    log('Settings: %o', validator.settings);

    const errors = [...validator.errors];

    errors.push(...(await checkSettings()));

    const issues: SpellCheckIssue[] = ranges
        .map((range, idx) => {
            const issues = validator
                .checkText(range, undefined, undefined)
                .map((issue) => normalizeIssue(issue, range, idx))
                .filter(filterIssues);
            return issues.length ? issues : undefined;
        })
        .filter((issues) => !!issues)
        .flat();

    return { issues, errors };

    async function checkSettings() {
        const finalSettings = validator.getFinalizedDocSettings();
        const found = await reportConfigurationErrors(finalSettings, knownConfigErrors);
        found.forEach((err) => (debugMode ? log(err) : log('Error: %s', err.message)));
        return found;
    }

    function normalizeIssue(issue: ValidationIssue, range: CheckTextRange, rangeIdx: number): SpellCheckIssue {
        const { text: word, offset: start, suggestionsEx: suggestions } = issue;
        const end = issue.offset + (issue.length || issue.text.length);
        let severity: SpellCheckIssue['severity'] = 'Unknown';
        severity = issue.hasPreferredSuggestions ? 'Misspelled' : severity;
        severity = issue.isFlagged ? 'Forbidden' : severity;
        const hasPreferredFixes = issue.hasPreferredSuggestions || false;
        const hasSimpleSuggestions = issue.hasSimpleSuggestions || false;
        return { word, start, end, suggestions, severity, range, rangeIdx, hasPreferredFixes, hasSimpleSuggestions };
    }
}

function generateReportingPredicate(report: Options['report']): (issue: SpellCheckIssue) => boolean {
    switch (report) {
        case 'simple': {
            return (issue: SpellCheckIssue) =>
                issue.severity in { Forbidden: true, Misspelled: true } ||
                (issue.severity === 'Unknown' && issue.hasSimpleSuggestions);
        }
        case 'flagged': {
            return (issue: SpellCheckIssue) => issue.severity === 'Forbidden';
        }
        case 'typos': {
            return (issue: SpellCheckIssue) => issue.severity in { Forbidden: true, Misspelled: true };
        }
    }
    // report === 'all' or undefined
    return () => true;
}

interface CachedDoc {
    filename: string;
    doc: TextDocument;
}

const cache: { lastDoc: CachedDoc | undefined } = { lastDoc: undefined };

const docValCache = new WeakMap<TextDocument, DocumentValidator>();

function getDocValidator(filename: string, text: string, options: SpellCheckOptions): DocumentValidator {
    const doc = getTextDocument(filename, text);
    const settings = calcInitialSettings(options);
    const cachedValidator = docValCache.get(doc);
    if (cachedValidator && deepEqual(cachedValidator.settings, settings)) {
        refreshDictionaryCache(0);
        cachedValidator.updateDocumentText(text).catch(() => undefined);
        return cachedValidator;
    }

    const resolveImportsRelativeTo = toFileURL(options.cspellOptionsRoot || import.meta.url, toFileDirURL(options.cwd));
    const report = options.report || 'all';
    const generateSuggestions =
        report in { simple: true, typos: true, flagged: true } ? false : options.generateSuggestions;
    const validator = new DocumentValidator(
        doc,
        { ...options, resolveImportsRelativeTo, generateSuggestions },
        settings,
    );
    docValCache.set(doc, validator);
    return validator;
}

export type ReportTypes = Exclude<Options['report'], undefined>;

type MapReportToUnknownWordChoices = {
    [key in ReportTypes]: UnknownWordsChoices;
};

export const mapReportToUnknownWordChoices: MapReportToUnknownWordChoices = {
    all: 'report-all',
    simple: 'report-simple',
    typos: 'report-common-typos',
    flagged: 'report-flagged',
} as const;

function mapReportToUnknownWords(report?: Options['report']): Pick<CSpellSettings, 'unknownWords'> {
    const unknownWords = report ? mapReportToUnknownWordChoices[report] : undefined;
    return unknownWords ? { unknownWords } : {};
}

function calcInitialSettings(options: SpellCheckOptions): CSpellSettings {
    const { customWordListFile, cspell, cwd } = options;

    const settings: CSpellSettings = {
        ...defaultSettings,
        ...cspell,
        words: cspell?.words || [],
        ignoreWords: cspell?.ignoreWords || [],
        flagWords: cspell?.flagWords || [],
        ...mapReportToUnknownWords(options.report),
    };

    if (options.configFile) {
        const optionCspellImport = options.cspell?.import;
        const importConfig =
            typeof optionCspellImport === 'string'
                ? [optionCspellImport]
                : Array.isArray(optionCspellImport)
                  ? optionCspellImport
                  : [];
        importConfig.push(options.configFile);
        settings.import = importConfig;
    }

    if (customWordListFile) {
        const filePath = isCustomWordListFile(customWordListFile) ? customWordListFile.path : customWordListFile;
        const { dictionaries = [], dictionaryDefinitions = [] } = settings;

        dictionaries.push('eslint-plugin-custom-words');
        dictionaryDefinitions.push({ name: 'eslint-plugin-custom-words', path: filePath });

        settings.dictionaries = dictionaries;
        settings.dictionaryDefinitions = dictionaryDefinitions;
    }

    resolveDictionaryPaths(settings.dictionaryDefinitions, cwd);

    return settings;
}

const regexIsUrl = /^(https?|file|ftp):/i;

/** Patches the path of dictionary definitions. */
function resolveDictionaryPaths(defs: CSpellSettings['dictionaryDefinitions'], cwd: string) {
    if (!defs) return;

    for (const def of defs) {
        if (!def.path) continue;
        if (regexIsUrl.test(def.path)) continue;
        def.path = path.resolve(cwd, def.path);
    }
}

function getTextDocument(filename: string, content: string): TextDocument {
    if (cache.lastDoc?.filename === filename) {
        return cache.lastDoc.doc;
    }

    const doc = createTextDocument({ uri: filename, content });
    cache.lastDoc = { filename, doc };
    return doc;
}

function isCustomWordListFile(value: string | CustomWordListFile | undefined): value is CustomWordListFile {
    return !!value && typeof value === 'object';
}

/**
 * Deep Equal check.
 * Note: There are faster methods, but this is called once per file, so speed is not a concern.
 */
function deepEqual(a: unknown, b: unknown): boolean {
    try {
        assert.deepStrictEqual(a, b);
        return true;
    } catch {
        return false;
    }
}

async function reportConfigurationErrors(config: CSpellSettings, knownConfigErrors: Set<string>): Promise<Error[]> {
    const errors: Error[] = [];

    const importErrors = extractImportErrors(config);
    importErrors.forEach((ref) => {
        const key = ref.error.toString();
        if (knownConfigErrors.has(key)) return;
        knownConfigErrors.add(key);
        errors.push(new Error('Configuration Error: \n  ' + ref.error.message));
    });

    const dictCollection = await getDictionary(config);
    dictCollection.dictionaries.forEach((dict) => {
        const dictErrors = dict.getErrors?.() || [];
        const msg = `Dictionary Error with (${dict.name})`;
        dictErrors.forEach((error) => {
            const key = msg + error.toString();
            if (knownConfigErrors.has(key)) return;
            knownConfigErrors.add(key);
            const errMsg = `${msg}: ${error.message}\n  Source: ${dict.source}`;
            errors.push(new Error(errMsg));
        });
    });

    return errors;
}
