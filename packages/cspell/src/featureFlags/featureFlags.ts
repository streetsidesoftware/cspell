import { FeatureFlags, getSystemFeatureFlags } from 'cspell-lib';

export function getFeatureFlags(): FeatureFlags {
    return getSystemFeatureFlags();
}

export function parseFeatureFlags(flags: string[] | undefined): FeatureFlags {
    const ff = getFeatureFlags();

    if (!flags) return ff;

    const flagsKvP = flags.map((f) => f.split(':', 2));

    for (const flag of flagsKvP) {
        const [name, value] = flag;
        try {
            ff.setFlag(name, value);
        } catch (e) {
            console.warn(`Unknown flag: "${name}"`);
        }
    }

    return ff;
}
