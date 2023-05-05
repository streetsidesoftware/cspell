import type { FeatureFlags } from './FeatureFlags.js';
import { UnknownFeatureFlagError } from './FeatureFlags.js';

const splitFlag = /[:=]/;
const leadingEql = /^=/;

export function parseFlags(ff: FeatureFlags, flags: string[]): FeatureFlags {
    for (const flag of flags) {
        const [name, value] = flag.replace(leadingEql, '').split(splitFlag, 2);

        try {
            ff.setFlag(name, value);
        } catch (e) {
            if (e instanceof UnknownFeatureFlagError) {
                console.error(e.message);
                console.error(ff.help());
            }
            throw e;
        }
    }

    return ff;
}
