import type { CSpellSettings } from '@cspell/cspell-types';
import type { CSpellConfigFile } from 'cspell-config-lib';

import { setConfigFieldValue } from './adjustConfig.js';
import type { CommentConfig } from './constants.js';

export function applyValuesToConfigFile(
    config: CSpellConfigFile,
    settings: CSpellSettings,
    defaultValues: CommentConfig,
    addComments: boolean,
): CSpellConfigFile {
    const currentSettings = config.settings || {};
    for (const [k, entry] of Object.entries(defaultValues)) {
        const { value: defaultValue, comment } = entry;
        const key = k as keyof CSpellSettings;
        const newValue = settings[key];
        const oldValue = currentSettings[key];
        const value = newValue ?? oldValue ?? defaultValue;
        if ((newValue === undefined && oldValue !== undefined) || value === undefined) {
            continue;
        }
        const useComment = (addComments && oldValue === undefined && comment) || undefined;
        setConfigFieldValue(config, key, value, useComment);
    }
    return config;
}
