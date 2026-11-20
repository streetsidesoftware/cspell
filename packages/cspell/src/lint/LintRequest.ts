import type { CSpellUserSettings, UnknownWordsConfiguration } from '@cspell/cspell-types';
import { unknownWordsChoices } from '@cspell/cspell-types';

import type { CSpellConfigFile, LinterCliOptions, LinterOptions } from '../options.js';
import type { FinalizedReporter } from '../reporters/LintFileResult.js';
import { resolveStopFolders } from '../util/configSearchStops.js';
import { applicationAssert } from '../util/errors.js';
import { createFolderLookup } from '../util/folderOnDisk.js';
import type { GlobSrcInfo } from '../util/glob.js';
import { calcExcludeGlobInfo } from '../util/glob.js';
import { sizeToNumber } from '../util/unitNumbers.js';

const defaultContextRange = 20;

interface Deprecated {
    fileLists?: LinterOptions['fileList'];
    local?: LinterOptions['locale'];
}

/**
 * The root and the `--stop-config-search-at` folders, as found on disk.
 */
export interface LintFolders {
    readonly root: string;
    readonly stopConfigSearchAt: URL[] | undefined;
}

/**
 * Look up the root and the `--stop-config-search-at` folders on disk, then create the request.
 */
export async function createLintRequest(
    fileGlobs: string[],
    options: LinterCliOptions & Deprecated,
    reporter: FinalizedReporter,
): Promise<LintRequest> {
    const lookup = createFolderLookup();
    const root = await lookup.find(options.root || process.cwd());
    applicationAssert(root, 'The --root path must be an existing folder.');
    const stopConfigSearchAt = await resolveStopFolders(options.stopConfigSearchAt, lookup);
    return new LintRequest(fileGlobs, options, reporter, { root, stopConfigSearchAt });
}

export class LintRequest {
    readonly locale: string;

    readonly configFile: string | CSpellConfigFile | undefined;
    readonly excludes: GlobSrcInfo[];
    readonly root: string;
    readonly stopConfigSearchAt: URL[] | undefined;
    readonly showContext: number;
    readonly enableGlobDot: boolean | undefined;
    readonly fileLists: string[];
    readonly files: string[] | undefined;
    readonly cspellSettingsFromCliOptions: CSpellUserSettings;
    readonly maxFileSize: number | undefined;

    constructor(
        readonly fileGlobs: string[],
        readonly options: LinterCliOptions & Deprecated,
        readonly reporter: FinalizedReporter,
        folders: LintFolders,
    ) {
        this.root = folders.root;
        this.stopConfigSearchAt = folders.stopConfigSearchAt;
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

        const noConfigSearch =
            options.configSearch === false ? true : options.configSearch === true ? false : undefined;
        const dictionaries = [
            ...(options.disableDictionary ?? []).map((d) => `!${d}`), // first disable dictionaries
            ...(options.dictionary ?? []).map((d) => `!!${d}`), // Use `!!` to ensure dictionaries are enabled
        ];
        const languageSettings: CSpellUserSettings['languageSettings'] = [
            // Use `*` to match all languages and locales
            { languageId: '*', locale: '*', dictionaries },
        ];
        this.cspellSettingsFromCliOptions = {
            ...(noConfigSearch !== undefined ? { noConfigSearch } : {}),
            ...(options.validateDirectives !== undefined ? { validateDirectives: options.validateDirectives } : {}),
            ...extractUnknownWordsConfig(options),
            languageSettings,
        };

        this.maxFileSize = options.maxFileSize ? sizeToNumber(options.maxFileSize) : undefined;
    }
}

function mergeFiles(a: string[] | undefined, b: string[] | undefined): string[] | undefined {
    const files = merge(a, b);
    if (!files) return undefined;
    return [...new Set(files.flatMap((a) => a.split('\n').map((a) => a.trimEnd())).filter((a) => !!a))];
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
