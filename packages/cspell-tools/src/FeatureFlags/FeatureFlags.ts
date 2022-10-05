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

    registerFeatures(flags: FeatureFlag[]): this {
        flags.forEach((flag) => this.register(flag));
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

        this.flagValues.set(flag, toBool(value) ?? value);
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

    help(): string {
        const flags = [{ name: 'Name', description: 'Description' }, ...this.flags.values()].sort((a, b) =>
            a.name < b.name ? -1 : 1
        );

        const nameColWidth = flags.map((f) => f.name.length).reduce((a, b) => Math.max(a, b), 0) + 1;
        const entries = flags.map((f) => `- ${f.name}${' '.repeat(nameColWidth - f.name.length)} ${f.description}`);

        const text = `Valid Flags:\n${entries.join('\n')}`;
        return text;
    }

    fork(): FeatureFlags {
        const fork = new FeatureFlags([...this.flags.values()]);
        for (const [key, value] of this.flagValues) {
            fork.flagValues.set(key, value);
        }
        return fork;
    }
}

export class UnknownFeatureFlagError extends Error {
    constructor(readonly flag: string) {
        super(`Unknown feature flag: ${flag}`);
    }
}

export function getSystemFeatureFlags(): FeatureFlags {
    return systemFeatureFlags || (systemFeatureFlags = createFeatureFlags());
}

export function createFeatureFlags(): FeatureFlags {
    return new FeatureFlags();
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
