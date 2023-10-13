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
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FeaturesActive {}

/**
 * These are feature settings that have been deprecated or moved elsewhere they will have no
 * effect on the code but are here to prevent schema errors. The will get cleaned out on major versions.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FeaturesDeprecated {}

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
