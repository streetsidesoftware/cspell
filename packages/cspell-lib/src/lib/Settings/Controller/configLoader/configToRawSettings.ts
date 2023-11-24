import type { ImportFileRef, Source } from '@cspell/cspell-types';
import type { CSpellConfigFile } from 'cspell-config-lib';

import { toFilePathOrHref } from '../../../util/url.js';
import { urlToSimpleId } from './configLoader.js';
import { normalizeImport, normalizeRawConfig } from './normalizeRawSettings.js';
import type { CSpellSettingsWST } from './types.js';

export function configErrorToRawSettings(error: Error, url: URL): CSpellSettingsWST {
    const filename = toFilePathOrHref(url);
    const fileRef: ImportFileRef = { filename, error };
    const source: Source = { name: filename, filename };
    return { __importRef: fileRef, source };
}

export function configToRawSettings(cfgFile: CSpellConfigFile | undefined): CSpellSettingsWST {
    if (!cfgFile) return {};
    const url = cfgFile.url;
    const filename = toFilePathOrHref(url);
    const fileRef: ImportFileRef = {
        filename,
        error: undefined,
    };

    const source: Source = {
        name: cfgFile.settings.name || filename,
        filename,
    };

    const rawSettings: CSpellSettingsWST = { ...cfgFile.settings };
    rawSettings.import = normalizeImport(rawSettings.import);
    normalizeRawConfig(rawSettings);
    rawSettings.source = source;
    rawSettings.__importRef = fileRef;

    const id = rawSettings.id || urlToSimpleId(url);
    const name = rawSettings.name || id;

    rawSettings.id = id;
    rawSettings.name = cfgFile.settings.name || name;

    return rawSettings;
}
