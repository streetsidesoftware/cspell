import { homedir } from 'node:os';

import type { CSpellUserSettings, GlobDef, LanguageSetting, ReporterSettings } from '@cspell/cspell-types';
import { fileURLToPath } from 'url';

import { resolveFile } from '../../../util/resolveFile.js';
import type { OptionalOrUndefined } from '../../../util/types.js';
import { resolveFileWithURL, toFilePathOrHref } from '../../../util/url.js';
import * as util from '../../../util/util.js';
import { mapDictDefsToInternal } from '../../DictionarySettings.js';
import { toGlobDef } from './toGlobDef.js';

interface NormalizableFields {
    version?: string | number;
    import?: string | string[];
}

export function normalizeRawConfig(config: CSpellUserSettings | NormalizableFields) {
    if (typeof config.version === 'number') {
        config.version = config.version.toString();
    }

    if (config.import) {
        config.import = normalizeImport(config.import);
    }
}

type NormalizeDictionaryDefsParams = OptionalOrUndefined<
    Pick<CSpellUserSettings, 'dictionaryDefinitions' | 'languageSettings'>
>;

export function normalizeDictionaryDefs(settings: NormalizeDictionaryDefsParams, settingsFileUrl: URL) {
    const dictionaryDefinitions = mapDictDefsToInternal(settings.dictionaryDefinitions, settingsFileUrl);
    const languageSettings = settings.languageSettings?.map((langSetting) =>
        util.clean({
            ...langSetting,
            dictionaryDefinitions: mapDictDefsToInternal(langSetting.dictionaryDefinitions, settingsFileUrl),
        }),
    );

    return util.clean({
        dictionaryDefinitions,
        languageSettings,
    });
}
type NormalizeOverrides = Pick<CSpellUserSettings, 'globRoot' | 'overrides'>;
type NormalizeOverridesResult = Pick<CSpellUserSettings, 'overrides'>;
export function normalizeOverrides(settings: NormalizeOverrides, pathToSettingsFile: URL): NormalizeOverridesResult {
    const { globRoot = toFilePathOrHref(new URL('.', pathToSettingsFile)) } = settings;
    const overrides = settings.overrides?.map((override) => {
        const filename = toGlobDef(override.filename, globRoot, toFilePathOrHref(pathToSettingsFile));
        const { dictionaryDefinitions, languageSettings } = normalizeDictionaryDefs(override, pathToSettingsFile);
        return util.clean({
            ...override,
            filename,
            dictionaryDefinitions,
            languageSettings: normalizeLanguageSettings(languageSettings),
        });
    });

    return overrides ? { overrides } : {};
}
type NormalizeReporters = Pick<CSpellUserSettings, 'reporters'>;
export async function normalizeReporters(
    settings: NormalizeReporters,
    pathToSettingsFile: URL,
): Promise<NormalizeReporters> {
    if (settings.reporters === undefined) return {};

    async function resolve(s: string): Promise<string> {
        if (s === 'default') return s;
        const r = await resolveFile(s, pathToSettingsFile);
        if (!r.found) {
            // console.warn('Not found: %o', { filename: s, relativeTo: pathToSettingsFile.href });
            throw new Error(`Not found: "${s}"`);
        }
        return r.filename;
    }

    async function resolveReporter(s: ReporterSettings): Promise<ReporterSettings> {
        if (typeof s === 'string') {
            return resolve(s);
        }
        if (!Array.isArray(s) || typeof s[0] !== 'string') throw new Error('Invalid Reporter');
        // Preserve the shape of Reporter Setting while resolving the reporter file.
        const [r, ...rest] = s;
        return [await resolve(r), ...rest];
    }

    return {
        reporters: await Promise.all(settings.reporters.map(resolveReporter)),
    };
}
export function normalizeLanguageSettings(
    languageSettings: LanguageSetting[] | undefined,
): LanguageSetting[] | undefined {
    if (!languageSettings) return undefined;

    function fixLocale(s: LanguageSetting): LanguageSetting {
        const { local: locale, ...rest } = s;
        return util.clean({ locale, ...rest });
    }

    return languageSettings.map(fixLocale);
}
type NormalizeGitignoreRoot = Pick<CSpellUserSettings, 'gitignoreRoot'>;
export function normalizeGitignoreRoot(
    settings: NormalizeGitignoreRoot,
    pathToSettingsFile: URL,
): NormalizeGitignoreRoot {
    const { gitignoreRoot } = settings;
    if (!gitignoreRoot) return {};

    const roots = Array.isArray(gitignoreRoot) ? gitignoreRoot : [gitignoreRoot];

    return {
        gitignoreRoot: roots.map((p) => resolveFilePathToPath(p, pathToSettingsFile)),
    };
}

interface NormalizeSettingsGlobs {
    globRoot?: CSpellUserSettings['globRoot'];
    ignorePaths?: CSpellUserSettings['ignorePaths'];
}
interface NormalizeSettingsGlobsResult {
    ignorePaths?: GlobDef[];
}
export function normalizeSettingsGlobs(
    settings: NormalizeSettingsGlobs,
    pathToSettingsFile: URL,
): NormalizeSettingsGlobsResult {
    const { globRoot } = settings;
    if (settings.ignorePaths === undefined) return {};

    const ignorePaths = toGlobDef(settings.ignorePaths, globRoot, toFilePathOrHref(pathToSettingsFile));
    return {
        ignorePaths,
    };
}
export function normalizeCacheSettings(
    settings: Pick<CSpellUserSettings, 'cache'>,
    pathToSettingsFile: URL,
): Pick<CSpellUserSettings, 'cache'> {
    const { cache } = settings;
    if (cache === undefined) return {};
    const { cacheLocation } = cache;
    if (cacheLocation === undefined) return { cache };
    return { cache: { ...cache, cacheLocation: toFilePathOrHref(resolveFilePath(cacheLocation, pathToSettingsFile)) } };
}

function resolveFilePath(filename: string, pathToSettingsFile: URL): URL {
    const cwd = process.cwd();
    return resolveFileWithURL(filename.replace('${cwd}', cwd).replace(/^~/, homedir()), pathToSettingsFile);
}

function resolveFilePathToPath(filename: string, pathToSettingsFile: URL): string {
    const url = resolveFilePath(filename, pathToSettingsFile);
    return url.protocol === 'file:' ? fileURLToPath(url) : url.toString();
}

export function normalizeImport(imports: string | string[] | undefined): string[] {
    if (typeof imports === 'string') {
        return [imports];
    }
    if (Array.isArray(imports)) {
        return imports;
    }
    return [];
}
