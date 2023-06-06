/**
 * No compounding allowed.
 */

export type CompoundModeNone = 'none';
/**
 * Allow natural compounding in the dictionary
 * using compound prefixes
 */

export type CompoundModesCompound = 'compound';
/**
 * Allow all possible compounds -- Very slow.
 */

export type CompoundModesLegacy = 'legacy';

export type CompoundModes = CompoundModeNone | CompoundModesCompound | CompoundModesLegacy;
