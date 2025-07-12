import type {
    CSpellSettingsWithSourceTrace,
    DictionaryDefinition,
    DictionaryDefinitionInline,
} from '@cspell/cspell-types';
import { combineTextAndLanguageSettings, getDefaultSettings, getGlobalSettingsAsync, mergeSettings } from 'cspell-lib';

import type { DictionariesOptions } from '../options.js';
import { readConfig } from '../util/configFileHelper.js';

export interface ListDictionariesResult {
    /**
     * The name of the dictionary.
     */
    name: string;
    /**
     * The description of the dictionary.
     */
    description?: string | undefined;
    /**
     * The path to the dictionary file.
     */
    path?: string | undefined;
    /**
     * True if the dictionary is enabled.
     */
    enabled: boolean;
    /**
     * The inline dictionaries supported by the dictionary.
     */
    inline?: string[] | undefined;
    /**
     * the languages locales supported by the dictionary.
     */
    locales?: string[] | undefined;
    /**
     * The file types supported by the dictionary.
     */
    fileTypes?: string[] | undefined;
}

interface InlineDictionaries {
    [name: string]: ListDictionariesResult;
}

const inlineDictionaries = {
    '[words]': {
        name: '[words]',
        description: 'List of words to be included in the spell check.',
        enabled: true,
    },
    '[flagWords]': {
        name: '[flagWords]',
        description: 'List of words to be flagged as incorrect.',
        enabled: true,
    },
    '[ignoreWords]': {
        name: '[ignoreWords]',
        description: 'List of words to be ignored in the spell check.',
        enabled: true,
    },
    '[suggestWords]': {
        name: '[suggestWords]',
        description: 'List of spelling suggestions for words.',
        enabled: true,
    },
} as const satisfies InlineDictionaries;

interface DictionaryLocalesAndFileTypes {
    locales: Set<string>;
    fileTypes: Set<string>;
}

function splitList(list: string | string[] | undefined): string[] {
    if (!list) return [];
    if (typeof list === 'string') {
        return list
            .split(',')
            .map((s) => s.trim())
            .filter((s) => !!s);
    }
    return list.flatMap((s) => splitList(s));
}

function extractDictionaryLocalesAndFileTypes(
    config: CSpellSettingsWithSourceTrace,
): Map<string, DictionaryLocalesAndFileTypes> {
    const map = new Map<string, DictionaryLocalesAndFileTypes>();

    function getDict(name: string): DictionaryLocalesAndFileTypes {
        const found = map.get(name);
        if (found) return found;
        const dict: DictionaryLocalesAndFileTypes = { locales: new Set(), fileTypes: new Set() };
        map.set(name, dict);
        return dict;
    }

    const languageSettings = config.languageSettings || [];
    for (const lang of languageSettings) {
        const locales = splitList(lang.locale);
        const fileTypes = splitList(lang.languageId);
        const dicts = lang.dictionaries || [];
        for (const dictName of dicts) {
            const dict = getDict(dictName);
            for (const locale of locales) {
                if (locale) dict.locales.add(locale);
            }
            for (const fileType of fileTypes) {
                if (fileType) dict.fileTypes.add(fileType);
            }
        }
    }

    return map;
}

function extractInlineDictionaries(dict: DictionaryDefinition): string[] | undefined {
    const iDict = dict as DictionaryDefinitionInline;
    const inline: string[] = [];
    if (iDict.words?.length) {
        inline.push('[words]');
    }
    if (iDict.flagWords?.length) {
        inline.push('[flagWords]');
    }
    if (iDict.ignoreWords?.length) {
        inline.push('[ignoreWords]');
    }
    if (iDict.suggestWords?.length) {
        inline.push('[suggestWords]');
    }
    return inline.length ? inline : undefined;
}

function extractSpecialDictionaries(config: CSpellSettingsWithSourceTrace): ListDictionariesResult[] {
    const specialDictionaries: ListDictionariesResult[] = [];
    if (config.words?.length) {
        specialDictionaries.push(inlineDictionaries['[words]']);
    }
    if (config.flagWords?.length) {
        specialDictionaries.push(inlineDictionaries['[flagWords]']);
    }
    if (config.ignoreWords?.length) {
        specialDictionaries.push(inlineDictionaries['[ignoreWords]']);
    }
    if (config.suggestWords?.length) {
        specialDictionaries.push(inlineDictionaries['[suggestWords]']);
    }
    return specialDictionaries;
}

export async function listDictionaries(options: DictionariesOptions): Promise<ListDictionariesResult[]> {
    const configFile = await readConfig(options.config, undefined);
    const loadDefault = options.defaultConfiguration ?? configFile.config.loadDefaultConfiguration ?? true;

    const configBase = mergeSettings(
        await getDefaultSettings(loadDefault),
        await getGlobalSettingsAsync(),
        configFile.config,
    );

    const useFileType = options.fileType === 'text' ? 'plaintext' : options.fileType;
    if (options.locale) {
        configBase.language = options.locale;
    }

    const config = combineTextAndLanguageSettings(configBase, '', useFileType || configBase.languageId || 'plaintext');

    const dictionaryLocalesAndFileTypes = extractDictionaryLocalesAndFileTypes(config);

    const enabledDictionaries = new Set(config.dictionaries || []);

    function toListDictionariesResult(dict: DictionaryDefinition): ListDictionariesResult {
        const inline = extractInlineDictionaries(dict);
        return {
            name: dict.name,
            description: dict.description,
            enabled: enabledDictionaries.has(dict.name),
            path: dict.path,
            inline,
            locales: [...(dictionaryLocalesAndFileTypes.get(dict.name)?.locales || [])].sort(),
            fileTypes: [...(dictionaryLocalesAndFileTypes.get(dict.name)?.fileTypes || [])].sort(),
        };
    }

    function filterDicts(dict: DictionaryDefinition): boolean {
        if (options.enabled === undefined) return true;
        return options.enabled === enabledDictionaries.has(dict.name);
    }

    const dictionaryDefinitions = (config.dictionaryDefinitions || []).filter(filterDicts);
    dictionaryDefinitions.sort((a, b) => a.name.localeCompare(b.name));

    const specialDicts = options.enabled !== false ? extractSpecialDictionaries(config) : [];

    return [...specialDicts, ...dictionaryDefinitions.map(toListDictionariesResult)];
}
