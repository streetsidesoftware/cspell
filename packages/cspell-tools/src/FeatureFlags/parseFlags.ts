import { FeatureFlags, UnknownFeatureFlagError } from './FeatureFlags';

const splitFlag = /[:=]/;
const leadingEql = /^=/;

export function parseFlags(ff: FeatureFlags, flags: string[]): FeatureFlags {
    for (const flag of flags) {
        const [name, value] = flag.replace(leadingEql, '').split(splitFlag, 2);

        try {
            ff.setFlag(name, value);
        } catch (e) {
            if (!(e instanceof UnknownFeatureFlagError)) {
                throw e;
            }
            console.error(e.message);
        }
    }

    return ff;
}
