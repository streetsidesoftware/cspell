import * as path from 'node:path';

import { type CSpellUserSettings, unknownWordsChoices, type UnknownWordsConfiguration } from '@cspell/cspell-types';

import type { CSpellConfigFile, LinterCliOptions, LinterOptions } from '../options.js';
import type { GlobSrcInfo } from '../util/glob.js';
import { calcExcludeGlobInfo } from '../util/glob.js';
import type { FinalizedReporter } from '../util/reporters.js';

const defaultContextRange = 20;

interface Deprecated {
    fileLists?: LinterOptions['fileList'];
    local?: LinterOptions['locale'];
}

export class LintRequest {
    readonly locale: string;

    readonly configFile: string | CSpellConfigFile | undefined;
    readonly excludes: GlobSrcInfo[];
    readonly root: string;
    readonly showContext: number;
    readonly enableGlobDot: boolean | undefined;
    readonly fileLists: string[];
    readonly files: string[] | undefined;
    readonly cspellSettingsFromCliOptions: CSpellUserSettings;

    constructor(
        readonly fileGlobs: string[],
        readonly options: LinterCliOptions & Deprecated,
        readonly reporter: FinalizedReporter,
    ) {
        this.root = path.resolve(options.root || process.cwd());
        this.configFile = options.config;
        this.excludes = calcExcludeGlobInfo(this.root, options.exclude);
        this.locale = options.locale ?? options.local ?? '';
        this.enableGlobDot = options.dot;
        this.showContext = Math.max(
            options.showContext === true ? defaultContextRange : options.showContext ? options.showContext : 0,
            0,
        );
        this.fileLists = (options.fileList ?? options.fileLists) || [];
        this.files = mergeFiles(options.file, options.files);
        const dictionaries = [
            ...(options.disableDictionary ?? []).map((d) => `!${d}`), // first disable dictionaries
            ...(options.dictionary ?? []).map((d) => `!!${d}`), // Use `!!` to ensure dictionaries are enabled
        ];
        const languageSettings: CSpellUserSettings['languageSettings'] = [
            // Use `*` to match all languages and locales
            { languageId: '*', locale: '*', dictionaries },
        ];
        this.cspellSettingsFromCliOptions = {
            ...extractUnknownWordsConfig(options),
            languageSettings,
        };
    }
}

function mergeFiles(a: string[] | undefined, b: string[] | undefined): string[] | undefined {
    const files = merge(a, b);
    if (!files) return undefined;
    return [...new Set(files.flatMap((a) => a.split('\n').map((a) => a.trim())).filter((a) => !!a))];
}

function merge<T>(a: T[] | undefined, b: T[] | undefined): T[] | undefined {
    if (!a) return b;
    if (!b) return a;
    return [...a, ...b];
}

export function extractUnknownWordsConfig(options: LinterCliOptions): UnknownWordsConfiguration {
    const config: UnknownWordsConfiguration = {};
    if (!options.report) return config;

    switch (options.report) {
        case 'all': {
            config.unknownWords = unknownWordsChoices.ReportAll;
            break;
        }
        case 'simple': {
            config.unknownWords = unknownWordsChoices.ReportSimple;
            break;
        }
        case 'typos': {
            config.unknownWords = unknownWordsChoices.ReportCommonTypos;
            break;
        }
        case 'flagged': {
            config.unknownWords = unknownWordsChoices.ReportFlagged;
            break;
        }
    }

    return config;
}
