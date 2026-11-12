/**
 * These are experimental features and are subject to change or removal without notice.
 */
export interface FeaturesExperimental {
    /**
     * Enable/disable using weighted suggestions.
     */
    'weighted-suggestions': FeatureEnableOnly;
}

/**
 * These are the current set of active features
 */
export interface FeaturesActive {
    /**
     * @hidden
     */
    featureName?: boolean;

    /**
     * Make the `filename` globs in `overrides` match only the path they name.
     *
     * When off, a glob also matches the files inside a folder with that name. For example, `examples.ts` matches a
     * file named `examples.ts` and every file inside a folder named `examples.ts`. A glob ending in `/**`, such as
     * `src/**`, also matches a file named `src`.
     *
     * When on:
     * - `examples.ts` and `/src` match only a file with that name.
     * - `src/**` matches only the files inside the `src` folder.
     * - To apply an override to the files in a folder, end the glob with `/`, for example `src/` or `/src/`.
     *
     * Only `overrides` are affected. `ignorePaths` and `files` match as before.
     *
     * @since 10.5.0
     * @default false
     */
    overrideGlobsMatchFilesOnly?: FeatureEnableOnly;
}

/**
 * These are feature settings that have been deprecated or moved elsewhere they will have no
 * effect on the code but are here to prevent schema errors. The will get cleaned out on major versions.
 */
export interface FeaturesDeprecated {
    /**
     * @hidden
     */
    featureName?: boolean;
}

/**
 * Features are behaviors or settings that can be explicitly configured.
 */
export interface Features extends Partial<FeaturesActive>, Partial<FeaturesDeprecated>, Partial<FeaturesExperimental> {}

export type Feature = FeatureEnableOnly | FeatureWithConfiguration;

export type FeatureEnableOnly = boolean;

/**
 * Feature Configuration.
 */
export interface FeatureWithConfiguration {
    enable: boolean;
}

export type FeatureNamesKnown = keyof Features;
export type FeatureNamesExperimental = keyof FeaturesExperimental;
export type FeatureNamesActive = keyof FeaturesActive;
export type FeatureNamesDeprecated = keyof FeaturesDeprecated;
