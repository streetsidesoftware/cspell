import { FeatureFlags, getSystemFeatureFlags, UnknownFeatureFlagError } from './FeatureFlags';

const splitFlag = /[:=]/;

export function parseFlags(flags: string[]): FeatureFlags {
    const ff = getSystemFeatureFlags();

    for (const flag of flags) {
        const [name, value] = flag.split(splitFlag, 2);

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
