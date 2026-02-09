import type { CSpellSettings } from './CSpellSettingsDef';

type SetOfMergeFunctions = {
    [K in keyof CSpellSettings]-?: (key: K, settings: CSpellSettings[]) => Pick<CSpellSettings, K> | undefined;
};

const mArr = mergeAppendArrays;
const mRec = mergeRecords;
const exKV = extractKeyValues;

const mergeDefinitionFunctions: SetOfMergeFunctions = {
    $schema: (key) => recKV(key, undefined),
    allowCompoundWords: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    cache: (key, settings) => recKV(key, mRec(exKV(key, settings))),
    caseSensitive: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    description: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    dictionaries: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    dictionaryDefinitions: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    enabled: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    enabledFileTypes: (key, settings) => recKV(key, mRec(exKV(key, settings))),
    enabledLanguageIds: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    enableFiletypes: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    enableGlobDot: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    engines: (key, settings) => recKV(key, mRec(exKV(key, settings))),
    failFast: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    features: (key, settings) => recKV(key, mRec(exKV(key, settings))),
    files: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    flagWords: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    gitignoreRoot: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    globRoot: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    id: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    ignorePaths: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    ignoreRandomStrings: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    ignoreRegExpList: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    ignoreWords: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    import: (key, settings) => recKV(key, mArr(exKV(key, settings).map(strArrToArr))),
    includeRegExpList: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    language: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    languageId: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    languageSettings: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    loadDefaultConfiguration: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    maxDuplicateProblems: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    maxFileSize: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    maxNumberOfProblems: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    minRandomLength: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    minWordLength: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    name: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    noConfigSearch: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    noSuggestDictionaries: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    numSuggestions: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    overrides: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    parser: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    patterns: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    pnpFiles: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    readonly: (key, settings) => recKV(key, orValue(exKV(key, settings))),
    reporters: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    showStatus: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    spellCheckDelayMs: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    suggestionNumChanges: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    suggestionsTimeout: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    suggestWords: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    unknownWords: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    useGitignore: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    usePnP: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    userWords: (key, settings) => recKV(key, mArr(exKV(key, settings))),
    validateDirectives: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    version: (key, settings) => recKV(key, lastValue(exKV(key, settings))),
    vfs: (key, settings) => recKV(key, mRec(exKV(key, settings))),
    words: (key, settings) => recKV(key, mArr(exKV(key, settings))),
};

type MergeSettingsFn = (settings: Partial<CSpellSettings>[]) => Partial<CSpellSettings> | undefined;

function makeMergeFn<K extends keyof CSpellSettings>(key: K): MergeSettingsFn {
    const fn = mergeDefinitionFunctions[key] as (
        key: K,
        settings: CSpellSettings[],
    ) => Pick<CSpellSettings, K> | undefined;
    return (settings) => fn(key, settings);
}

const mergeIndividualSettingsFns = Object.keys(mergeDefinitionFunctions).map((k) =>
    makeMergeFn(k as keyof CSpellSettings),
);

export function mergeConfig(settings: CSpellSettings[]): CSpellSettings;
export function mergeConfig(...settings: [CSpellSettings, ...CSpellSettings[]]): CSpellSettings;
export function mergeConfig(...settings: [CSpellSettings[], ...CSpellSettings[]]): CSpellSettings;
export function mergeConfig(first: CSpellSettings[] | CSpellSettings, ...configs: CSpellSettings[]): CSpellSettings {
    const settings = [first, ...configs].flat();
    if (settings.length === 1) return settings[0];

    const result = Object.assign(Object.create(null), ...settings);
    Object.assign(result, ...mergeIndividualSettingsFns.map((fn) => fn(settings)));

    return result;
}

function orValue<T>(values: T[]): T | undefined {
    let v: T | undefined = undefined;
    for (const value of values) {
        v ||= value;
    }
    return v;
}

export function lastValue<T>(values: (T | undefined)[]): T | undefined {
    for (let i = values.length - 1; i >= 0; i--) {
        const value = values[i];
        if (value !== undefined) {
            return value;
        }
    }
    return undefined;
}

function strArrToArr<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

export function mergeAppendArrays<T>(arrays: [T, ...(T[] | undefined)[]]): T[];
export function mergeAppendArrays<T>(arrays: (T[] | undefined)[]): T[] | undefined;
export function mergeAppendArrays<T>(arrays: (T[] | undefined)[]): T[] | undefined {
    const values = arrays.filter((a): a is T[] => !!a);
    if (values.length === 1) return values[0];
    const merged = values.flat();
    return merged.length ? merged : undefined;
}

export function mergeRecords<T extends object>(records: [T, ...(T | undefined)[]]): T;
export function mergeRecords<T extends object>(records: (T | undefined)[]): T | undefined;
export function mergeRecords<T extends object>(records: (T | undefined)[]): T | undefined {
    const values = records.filter((r): r is T => !!r);
    if (!values.length) return undefined;
    if (values.length === 1) return values[0];
    return Object.assign(Object.create(null), ...values);
}

export function extractKeyValues<T, K extends keyof T>(key: K, records: (T | undefined)[]): Exclude<T[K], undefined>[] {
    return records
        .filter((r): r is T => !!r)
        .map((r) => r[key])
        .filter((v): v is Exclude<T[K], undefined> => v !== undefined);
}

function recKV<K extends keyof CSpellSettings>(
    key: K,
    value: CSpellSettings[K] | undefined,
): Pick<CSpellSettings, K> | undefined {
    if (value === undefined) return undefined;
    return { [key]: value } as Pick<CSpellSettings, K>;
}
