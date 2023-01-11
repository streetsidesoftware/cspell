import { format } from 'util';
import type { CSpellSettings, CSpellSettingsWithSourceTrace } from '@cspell/cspell-types';
import ConfigStore from 'configstore';

import { isErrnoException } from '../util/errors';
import { logError } from '../util/logger';

const packageName = 'cspell';

export interface GlobalSettingsWithSource extends Partial<GlobalCSpellSettings> {
    source: CSpellSettingsWithSourceTrace['source'];
}

export interface GlobalCSpellSettings {
    import: CSpellSettings['import'];
}

export function getRawGlobalSettings(): GlobalSettingsWithSource {
    const name = 'CSpell Configstore';

    const globalConf: GlobalSettingsWithSource = {
        source: {
            name,
            filename: undefined,
        },
    };

    try {
        const cfgStore = new ConfigStore(packageName);
        const cfg = cfgStore.all;
        // Only populate globalConf is there are values.
        if (cfg && Object.keys(cfg).length) {
            Object.assign(globalConf, cfg);
            globalConf.source = {
                name,
                filename: cfgStore.path,
            };
        }
    } catch (error) {
        if (
            !isErrnoException(error) ||
            !error.code ||
            !['ENOENT', 'EACCES', 'ENOTDIR', 'EISDIR'].includes(error.code)
        ) {
            logError(error);
        }
    }

    return globalConf;
}

export function writeRawGlobalSettings(settings: GlobalCSpellSettings): Error | undefined {
    const toWrite: GlobalCSpellSettings = {
        import: settings.import,
    };

    try {
        const cfgStore = new ConfigStore(packageName);
        cfgStore.set(toWrite);
        return undefined;
    } catch (error) {
        if (error instanceof Error) return error;
        return new Error(format(error));
    }
}

export function getGlobalConfigPath(): string {
    const cfgStore = new ConfigStore(packageName);
    return cfgStore.path;
}
