import type { FeatureFlags } from 'cspell-lib';
import { getSystemFeatureFlags } from 'cspell-lib';

export function getFeatureFlags(): FeatureFlags {
    return getSystemFeatureFlags();
}

export function parseFeatureFlags(flags: string[] | undefined, featureFlags = getFeatureFlags()): FeatureFlags {
    if (!flags) return featureFlags;

    const flagsKvP = flags.map((f) => f.split(':', 2));

    for (const flag of flagsKvP) {
        const [name, value] = flag;
        try {
            featureFlags.setFlag(name, value);
        } catch (e) {
            console.warn(`Unknown flag: "${name}"`);
        }
    }

    return featureFlags;
}
