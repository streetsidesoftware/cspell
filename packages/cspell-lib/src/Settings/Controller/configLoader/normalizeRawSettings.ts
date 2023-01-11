import type { CSpellUserSettings, GlobDef, LanguageSetting, ReporterSettings } from '@cspell/cspell-types';
import * as path from 'path';
import { resolveFile } from '../../../util/resolveFile';
import type { OptionalOrUndefined } from '../../../util/types';
import * as util from '../../../util/util';
import { mapDictDefsToInternal } from '../../DictionarySettings';
import { toGlobDef } from './toGlobDef';

interface NormalizableFields {
    version?: string | number;
}

export function normalizeRawConfig(config: CSpellUserSettings | NormalizableFields) {
    if (typeof config.version === 'number') {
        config.version = config.version.toString();
    }
}

type NormalizeDictionaryDefsParams = OptionalOrUndefined<
    Pick<CSpellUserSettings, 'dictionaryDefinitions' | 'languageSettings'>
>;
export function normalizeDictionaryDefs(settings: NormalizeDictionaryDefsParams, pathToSettingsFile: string) {
    const dictionaryDefinitions = mapDictDefsToInternal(settings.dictionaryDefinitions, pathToSettingsFile);
    const languageSettings = settings.languageSettings?.map((langSetting) =>
        util.clean({
            ...langSetting,
            dictionaryDefinitions: mapDictDefsToInternal(langSetting.dictionaryDefinitions, pathToSettingsFile),
        })
    );

    return util.clean({
        dictionaryDefinitions,
        languageSettings,
    });
}
type NormalizeOverrides = Pick<CSpellUserSettings, 'globRoot' | 'overrides'>;
type NormalizeOverridesResult = Pick<CSpellUserSettings, 'overrides'>;
export function normalizeOverrides(settings: NormalizeOverrides, pathToSettingsFile: string): NormalizeOverridesResult {
    const { globRoot = path.dirname(pathToSettingsFile) } = settings;
    const overrides = settings.overrides?.map((override) => {
        const filename = toGlobDef(override.filename, globRoot, pathToSettingsFile);
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
export function normalizeReporters(settings: NormalizeReporters, pathToSettingsFile: string): NormalizeReporters {
    if (settings.reporters === undefined) return {};
    const folder = path.dirname(pathToSettingsFile);

    function resolve(s: string): string {
        const r = resolveFile(s, folder);
        if (!r.found) {
            throw new Error(`Not found: "${s}"`);
        }
        return r.filename;
    }

    function resolveReporter(s: ReporterSettings): ReporterSettings {
        if (typeof s === 'string') {
            return resolve(s);
        }
        if (!Array.isArray(s) || typeof s[0] !== 'string') throw new Error('Invalid Reporter');
        // Preserve the shape of Reporter Setting while resolving the reporter file.
        const [r, ...rest] = s;
        return [resolve(r), ...rest];
    }

    return {
        reporters: settings.reporters.map(resolveReporter),
    };
}
export function normalizeLanguageSettings(
    languageSettings: LanguageSetting[] | undefined
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
    pathToSettingsFile: string
): NormalizeGitignoreRoot {
    const { gitignoreRoot } = settings;
    if (!gitignoreRoot) return {};

    const dir = path.dirname(pathToSettingsFile);
    const roots = Array.isArray(gitignoreRoot) ? gitignoreRoot : [gitignoreRoot];

    return {
        gitignoreRoot: roots.map((p) => path.resolve(dir, p)),
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
    pathToSettingsFile: string
): NormalizeSettingsGlobsResult {
    const { globRoot } = settings;
    if (settings.ignorePaths === undefined) return {};

    const ignorePaths = toGlobDef(settings.ignorePaths, globRoot, pathToSettingsFile);
    return {
        ignorePaths,
    };
}
export function normalizeCacheSettings(
    settings: Pick<CSpellUserSettings, 'cache'>,
    pathToSettingsDir: string
): Pick<CSpellUserSettings, 'cache'> {
    const { cache } = settings;
    if (cache === undefined) return {};
    const { cacheLocation } = cache;
    if (cacheLocation === undefined) return { cache };
    return { cache: { ...cache, cacheLocation: resolveFilePath(cacheLocation, pathToSettingsDir) } };
}

function resolveFilePath(filename: string, pathToSettingsFile: string): string {
    const cwd = process.cwd();

    return path.resolve(pathToSettingsFile, filename.replace('${cwd}', cwd));
}
