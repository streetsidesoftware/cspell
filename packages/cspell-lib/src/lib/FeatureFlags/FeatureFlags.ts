export interface FeatureFlag {
    name: string;
    description: string;
}

let systemFeatureFlags: FeatureFlags | undefined;

type FlagTypes = string | boolean;

/**
 * Feature Flags are used to turn on/off features.
 * These are primarily used before a feature has been fully released.
 */
export class FeatureFlags {
    private flags: Map<string, FeatureFlag>;
    private flagValues = new Map<string, FlagTypes>();

    constructor(flags: FeatureFlag[] = []) {
        this.flags = new Map(flags.map((f) => [f.name, f]));
    }

    register(flag: FeatureFlag): this;
    register(name: string, description: string): this;
    register(flagOrName: string | FeatureFlag, description?: string): this {
        if (typeof flagOrName === 'string') {
            return this.register({ name: flagOrName, description: description || '' });
        }
        this.flags.set(flagOrName.name, flagOrName);
        return this;
    }

    getFlag(flag: string): FlagTypes | undefined {
        return this.flagValues.get(flag);
    }

    getFlagBool(flag: string): boolean | undefined {
        return toBool(this.getFlag(flag));
    }

    setFlag(flag: string, value: FlagTypes = true): this {
        if (!this.flags.has(flag)) {
            throw new UnknownFeatureFlagError(flag);
        }

        this.flagValues.set(flag, value);
        return this;
    }

    getFlagInfo(flag: string): FeatureFlag | undefined {
        return this.flags.get(flag);
    }

    getFlags(): FeatureFlag[] {
        return [...this.flags.values()];
    }

    getFlagValues(): Map<string, FlagTypes> {
        return new Map(this.flagValues);
    }

    reset(): this {
        this.flagValues.clear();
        return this;
    }
}

export class UnknownFeatureFlagError extends Error {
    constructor(readonly flag: string) {
        super(`Unknown feature flag: ${flag}`);
    }
}

export function getSystemFeatureFlags(): FeatureFlags {
    return systemFeatureFlags || (systemFeatureFlags = new FeatureFlags());
}

const boolValues: Record<string, boolean | undefined> = {
    0: false,
    1: true,
    f: false,
    false: false,
    n: false,
    no: false,
    t: true,
    true: true,
    y: true,
    yes: true,
};

function toBool(value: boolean | string | undefined): boolean | undefined {
    if (typeof value !== 'string') return value;
    return boolValues[value.toLowerCase()];
}
