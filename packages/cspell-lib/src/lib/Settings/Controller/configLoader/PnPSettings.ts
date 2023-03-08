import type { CSpellSettings, PnPSettings } from '@cspell/cspell-types';

import type { OptionalOrUndefined } from '../../../util/types.js';
import { clean } from '../../../util/util.js';

export type PnPSettingsOptional = OptionalOrUndefined<PnPSettings>;

export const defaultPnPSettings: PnPSettings = Object.freeze({});

let lastPnP: PnPSettings = defaultPnPSettings;

/**
 * create PnPSettings object that can be used to compare to the last call.
 * This is to reduce object churn and unnecessary configuration loading.
 * @param settings - value to normalize
 * @returns
 */
export function normalizePnPSettings(settings: PnPSettingsOptional | CSpellSettings): PnPSettings {
    if (equal(lastPnP, settings)) return lastPnP;
    if (equal(defaultPnPSettings, settings)) return defaultPnPSettings;
    const { usePnP, pnpFiles } = settings;
    return (lastPnP = clean({ usePnP, pnpFiles }));
}

function equal(a: PnPSettingsOptional, b: PnPSettingsOptional): boolean {
    return (
        a === b ||
        (a.usePnP === b.usePnP && (a.pnpFiles === b.pnpFiles || a.pnpFiles?.join('|') === b.pnpFiles?.join('|')))
    );
}
